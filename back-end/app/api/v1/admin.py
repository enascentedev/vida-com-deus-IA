import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user_id
from app.core.scraper import run_etl
from app.core.storage import append_etl_run, get_etl_runs
from app.domain.admin.schemas import (
    AlertsResponse,
    ETLExecuteResponse,
    ETLRun,
    ETLRunsResponse,
    GrowthDay,
    GrowthMetric,
    StorageMetric,
    SystemAlert,
    TableBreakdownResponse,
    TableStat,
)

router = APIRouter(prefix="/admin", tags=["Admin"])

_GB = 1_073_741_824  # bytes em 1 GiB
_MB = 1_048_576      # bytes em 1 MiB

# Nomes dos dias da semana em pt-BR (weekday() → 0=Seg … 6=Dom)
_WEEKDAY = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


# ---------------------------------------------------------------------------
#  Métricas de armazenamento (dados reais do PostgreSQL)
# ---------------------------------------------------------------------------

@router.get("/metrics/storage", response_model=StorageMetric)
async def get_storage_metrics(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> StorageMetric:
    """Retorna métricas reais de armazenamento consultando pg_database_size."""
    result = await db.execute(text("SELECT pg_database_size(current_database())"))
    used_bytes: int = result.scalar_one()
    total_bytes: int = settings.render_db_size_bytes

    # Grava snapshot diário — idempotente (uma única entrada por dia)
    await db.execute(
        text("""
            INSERT INTO storage_snapshots (used_bytes, total_bytes)
            SELECT :used_bytes, :total_bytes
            WHERE NOT EXISTS (
                SELECT 1 FROM storage_snapshots
                WHERE measured_at >= CURRENT_DATE
                  AND measured_at < CURRENT_DATE + INTERVAL '1 day'
            )
        """),
        {"used_bytes": used_bytes, "total_bytes": total_bytes},
    )

    used_gb = round(used_bytes / _GB, 4)
    total_gb = round(total_bytes / _GB, 2)
    usage_percent = round((used_bytes / total_bytes) * 100, 1)
    free_percent = round(100 - usage_percent, 1)

    return StorageMetric(
        used_bytes=used_bytes,
        total_bytes=total_bytes,
        used_gb=used_gb,
        total_gb=total_gb,
        usage_percent=usage_percent,
        free_percent=free_percent,
    )


@router.get("/metrics/growth", response_model=GrowthMetric)
async def get_growth_metrics(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> GrowthMetric:
    """Calcula crescimento dos últimos 7 dias a partir dos snapshots diários."""
    rows = (
        await db.execute(
            text("""
                SELECT DISTINCT ON (DATE(measured_at))
                    DATE(measured_at) AS day,
                    used_bytes
                FROM storage_snapshots
                ORDER BY DATE(measured_at) DESC, measured_at DESC
                LIMIT 7
            """)
        )
    ).mappings().fetchall()

    if not rows:
        return GrowthMetric(percentage="+0%", growth_gb="0.00", history=[])

    # Ordena do mais antigo para o mais recente para o gráfico
    rows = list(reversed(rows))

    history = [
        GrowthDay(
            day=_WEEKDAY[row["day"].weekday()],
            value_gb=round(row["used_bytes"] / _GB, 5),
        )
        for row in rows
    ]

    if len(rows) >= 2:
        oldest_bytes: int = rows[0]["used_bytes"]
        latest_bytes: int = rows[-1]["used_bytes"]
        delta_bytes = latest_bytes - oldest_bytes
        delta_gb = delta_bytes / _GB
        pct = round((delta_bytes / oldest_bytes) * 100, 1) if oldest_bytes > 0 else 0.0
        sign = "+" if pct >= 0 else ""
        percentage = f"{sign}{pct}%"
        growth_gb = f"{abs(delta_gb):.3f}"
    else:
        percentage = "+0%"
        growth_gb = "0.000"

    return GrowthMetric(percentage=percentage, growth_gb=growth_gb, history=history)


@router.get("/metrics/tables", response_model=TableBreakdownResponse)
async def get_table_metrics(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> TableBreakdownResponse:
    """Retorna tamanho real de cada tabela do banco via pg_stat_user_tables."""
    rows = (
        await db.execute(
            text("""
                SELECT
                    relname                              AS table_name,
                    pg_total_relation_size(relid)        AS total_bytes,
                    pg_relation_size(relid)              AS data_bytes,
                    pg_indexes_size(relid)               AS index_bytes,
                    n_live_tup                           AS rows_estimate
                FROM pg_stat_user_tables
                ORDER BY total_bytes DESC
                LIMIT 15
            """)
        )
    ).mappings().fetchall()

    tables = [
        TableStat(
            table_name=row["table_name"],
            total_bytes=row["total_bytes"],
            data_bytes=row["data_bytes"],
            index_bytes=row["index_bytes"],
            total_mb=round(row["total_bytes"] / _MB, 3),
            rows_estimate=row["rows_estimate"],
        )
        for row in rows
    ]

    return TableBreakdownResponse(tables=tables, measured_at=_now_iso())


# ---------------------------------------------------------------------------
#  ETL
# ---------------------------------------------------------------------------

@router.get("/etl/runs", response_model=ETLRunsResponse)
def list_etl_runs(user_id: str = Depends(get_current_user_id)) -> ETLRunsResponse:
    """Lista as últimas execuções reais de ETL (persistidas em etl_runs.json)."""
    raw = get_etl_runs()
    runs = []
    for item in raw:
        try:
            runs.append(ETLRun(**item))
        except Exception:
            continue
    return ETLRunsResponse(runs=runs)


@router.post("/etl/runs/execute", response_model=ETLExecuteResponse, status_code=202)
async def execute_etl_endpoint(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> ETLExecuteResponse:
    """Dispara scraping manual de wgospel.com e persiste posts no banco."""
    started_at = _now_iso()
    t0 = time.monotonic()

    result = await run_etl(db)

    elapsed = time.monotonic() - t0
    duration = f"{elapsed:.0f}s" if elapsed >= 1 else f"{elapsed * 1000:.0f}ms"
    status = result.get("status", "success")
    run_id = f"etl-manual-{started_at}"

    append_etl_run({
        "id": run_id,
        "name": "Scraping wgospel.com",
        "status": "success" if status == "success" else "failed",
        "started_at": started_at,
        "duration": duration,
        "error": result.get("error"),
    })

    return ETLExecuteResponse(
        run_id=run_id,
        message=result.get("message", "ETL concluído."),
        status=status,
    )


# ---------------------------------------------------------------------------
#  Alertas (gerados a partir do uso real)
# ---------------------------------------------------------------------------

@router.get("/alerts", response_model=AlertsResponse)
async def get_alerts(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> AlertsResponse:
    """Gera alertas baseados no uso real do banco de dados."""
    result = await db.execute(text("SELECT pg_database_size(current_database())"))
    used_bytes: int = result.scalar_one()
    total_bytes: int = settings.render_db_size_bytes
    usage_percent = (used_bytes / total_bytes) * 100

    alerts: list[SystemAlert] = []
    now = _now_iso()
    plan_gb = total_bytes // _GB

    if usage_percent >= 85:
        alerts.append(SystemAlert(
            id="alert-storage-critical",
            title=f"Storage Crítico: {usage_percent:.1f}%",
            subtitle=f"Ação imediata — banco próximo do limite de {plan_gb}GB (Render)",
            level="critical",
            triggered_at=now,
        ))
    elif usage_percent >= 70:
        alerts.append(SystemAlert(
            id="alert-storage-warning",
            title=f"Storage > 70%: {usage_percent:.1f}%",
            subtitle=f"Considere fazer upgrade do plano Render ({plan_gb}GB atual)",
            level="warning",
            triggered_at=now,
        ))
    else:
        alerts.append(SystemAlert(
            id="alert-storage-ok",
            title="Storage em níveis normais",
            subtitle=f"{usage_percent:.1f}% utilizado — plano {plan_gb}GB (Render)",
            level="info",
            triggered_at=now,
        ))

    # Alerta de ETL — verifica última execução
    runs = get_etl_runs()
    if runs:
        last_run = runs[-1]
        if last_run.get("status") == "failed":
            alerts.append(SystemAlert(
                id="alert-etl-failed",
                title="Falha no último ETL",
                subtitle=last_run.get("error") or "Erro desconhecido no scraping",
                level="error",
                triggered_at=last_run.get("started_at", now),
            ))

    return AlertsResponse(alerts=alerts)
