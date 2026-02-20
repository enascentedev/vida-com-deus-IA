from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.core.dependencies import get_current_user_id
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

MOCK_ETL_RUNS = [
    ETLRun(
        id="etl-001",
        name="Bible RAG Update",
        status="success",
        started_at="2024-10-25T09:42:00Z",
        duration="12s",
    ),
    ETLRun(
        id="etl-002",
        name="Devotional Sync",
        status="success",
        started_at="2024-10-24T23:15:00Z",
        duration="45s",
    ),
    ETLRun(
        id="etl-003",
        name="User Insights Batch",
        status="failed",
        started_at="2024-10-24T14:00:00Z",
        duration="—",
        error="API Timeout",
    ),
]

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
def get_etl_runs(user_id: str = Depends(get_current_user_id)) -> ETLRunsResponse:
    """Lista as últimas execuções de ETL."""
    return ETLRunsResponse(runs=MOCK_ETL_RUNS)


@router.post("/etl/runs/execute", response_model=ETLExecuteResponse, status_code=202)
def execute_etl(user_id: str = Depends(get_current_user_id)) -> ETLExecuteResponse:
    """Dispara uma execução manual de ETL."""
    return ETLExecuteResponse(
        run_id=f"etl-manual-{_now_iso()}",
        message="ETL iniciado com sucesso.",
        status="running",
    )


@router.get("/alerts", response_model=AlertsResponse)
def get_alerts(user_id: str = Depends(get_current_user_id)) -> AlertsResponse:
    """Retorna alertas operacionais recentes."""
    return AlertsResponse(alerts=MOCK_ALERTS)
