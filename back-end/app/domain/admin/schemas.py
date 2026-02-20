from typing import Literal

from pydantic import BaseModel


class StorageMetric(BaseModel):
    used_bytes: int
    total_bytes: int
    used_gb: float
    total_gb: float
    usage_percent: float
    free_percent: float


class GrowthDay(BaseModel):
    day: str
    value_gb: float


class GrowthMetric(BaseModel):
    percentage: str
    growth_gb: str
    history: list[GrowthDay]


class ETLRun(BaseModel):
    id: str
    name: str
    status: Literal["success", "failed", "running", "pending"]
    started_at: str
    duration: str
    error: str | None = None


class ETLRunsResponse(BaseModel):
    runs: list[ETLRun]


class ETLExecuteResponse(BaseModel):
    run_id: str
    message: str
    status: str


class SystemAlert(BaseModel):
    id: str
    title: str
    subtitle: str
    level: Literal["info", "warning", "error", "critical"]
    triggered_at: str


class AlertsResponse(BaseModel):
    alerts: list[SystemAlert]
