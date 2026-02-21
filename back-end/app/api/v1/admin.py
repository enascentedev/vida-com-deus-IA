import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

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
)

router = APIRouter(prefix="/admin", tags=["Admin"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


MOCK_STORAGE = StorageMetric(
    used_bytes=1_503_238_553,
    total_bytes=2_147_483_648,
    used_gb=1.4,
    total_gb=2.0,
    usage_percent=70.0,
    free_percent=30.0,
)

MOCK_GROWTH = GrowthMetric(
    percentage="+12%",
    growth_gb="+0.2GB",
    history=[
        GrowthDay(day="Seg", value_gb=1.1),
        GrowthDay(day="Ter", value_gb=1.15),
        GrowthDay(day="Qua", value_gb=1.2),
        GrowthDay(day="Qui", value_gb=1.25),
        GrowthDay(day="Sex", value_gb=1.3),
        GrowthDay(day="Sáb", value_gb=1.35),
        GrowthDay(day="Dom", value_gb=1.4),
    ],
)

MOCK_ALERTS = [
    SystemAlert(
        id="alert-001",
        title="Storage > 70%",
        subtitle="Capacity threshold reached",
        level="warning",
        triggered_at="2024-10-25T09:20:00Z",
    ),
    SystemAlert(
        id="alert-002",
        title="Index Optimized",
        subtitle="Maintenance cycle complete",
        level="info",
        triggered_at="2024-10-25T05:00:00Z",
    ),
    SystemAlert(
        id="alert-003",
        title="Connection Spike",
        subtitle="RAG service high latency",
        level="error",
        triggered_at="2024-10-24T12:00:00Z",
    ),
]


@router.get("/metrics/storage", response_model=StorageMetric)
def get_storage_metrics(user_id: str = Depends(get_current_user_id)) -> StorageMetric:
    """Retorna métricas de armazenamento atual."""
    return MOCK_STORAGE


@router.get("/metrics/growth", response_model=GrowthMetric)
def get_growth_metrics(user_id: str = Depends(get_current_user_id)) -> GrowthMetric:
    """Retorna histórico de crescimento nos últimos 7 dias."""
    return MOCK_GROWTH


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


@router.get("/alerts", response_model=AlertsResponse)
def get_alerts(user_id: str = Depends(get_current_user_id)) -> AlertsResponse:
    """Retorna alertas operacionais recentes."""
    return AlertsResponse(alerts=MOCK_ALERTS)
