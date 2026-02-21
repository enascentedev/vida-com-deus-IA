from typing import Literal

from pydantic import BaseModel, EmailStr


# --- Sessao Terapeutica ---

class TherapySession(BaseModel):
    id: str
    patient_id: str
    date: str
    summary: str
    mood: Literal["very_low", "low", "neutral", "good", "great"]
    topics_covered: list[str] = []
    homework: str | None = None
    next_session_date: str | None = None
    created_at: str


# --- Paciente: ficha completa ---

class PatientConfig(BaseModel):
    id: str
    name: str
    email: EmailStr
    status: Literal["active", "paused", "discharged"] = "active"
    created_at: str

    # Avaliacao clinica
    chief_complaint: str | None = None
    anxiety_level: Literal["none", "mild", "moderate", "severe"] | None = None
    depression_level: Literal["none", "mild", "moderate", "severe"] | None = None
    sleep_quality: Literal["good", "fair", "poor", "very_poor"] | None = None
    suicidal_ideation: bool = False
    current_medication: str | None = None

    # Diretrizes para IA
    therapy_goal: str | None = None
    therapeutic_approach: str | None = None
    focus_topics: list[str] = []
    avoid_topics: list[str] = []
    response_depth: Literal["brief", "moderate", "detailed"] = "moderate"

    # Controle de mensagens
    messages_used: int = 0
    messages_limit: int = 100

    sessions: list[TherapySession] = []


# --- Paciente: versao resumida para listagem ---

class PatientSummary(BaseModel):
    id: str
    name: str
    email: EmailStr
    status: Literal["active", "paused", "discharged"]
    messages_used: int
    messages_limit: int
    created_at: str


# --- Request: cadastro (intake) ---

class PatientIntakeForm(BaseModel):
    name: str
    email: EmailStr

    # Avaliacao clinica
    chief_complaint: str | None = None
    anxiety_level: Literal["none", "mild", "moderate", "severe"] | None = None
    depression_level: Literal["none", "mild", "moderate", "severe"] | None = None
    sleep_quality: Literal["good", "fair", "poor", "very_poor"] | None = None
    suicidal_ideation: bool = False
    current_medication: str | None = None

    # Diretrizes para IA
    therapy_goal: str | None = None
    therapeutic_approach: str | None = None
    focus_topics: list[str] = []
    avoid_topics: list[str] = []
    response_depth: Literal["brief", "moderate", "detailed"] = "moderate"
    messages_limit: int = 100

    # Primeira sessao (opcional)
    first_session_date: str | None = None
    first_session_summary: str | None = None
    first_session_mood: Literal["very_low", "low", "neutral", "good", "great"] | None = None


# --- Response: visao geral do dashboard ---

class NearLimitPatient(BaseModel):
    id: str
    name: str
    messages_used: int
    messages_limit: int


class RecentActivity(BaseModel):
    patient_name: str
    action: str
    timestamp: str


class DashboardOverview(BaseModel):
    total_patients: int
    active_patients: int
    paused_patients: int
    discharged_patients: int
    near_limit_patients: list[NearLimitPatient]
    recent_activity: list[RecentActivity]


# --- Response: lista de pacientes ---

class PatientListResponse(BaseModel):
    patients: list[PatientSummary]
    total: int


# --- Request: atualizacao parcial do paciente ---

class UpdatePatientConfigRequest(BaseModel):
    chief_complaint: str | None = None
    anxiety_level: Literal["none", "mild", "moderate", "severe"] | None = None
    depression_level: Literal["none", "mild", "moderate", "severe"] | None = None
    sleep_quality: Literal["good", "fair", "poor", "very_poor"] | None = None
    suicidal_ideation: bool | None = None
    current_medication: str | None = None
    therapy_goal: str | None = None
    therapeutic_approach: str | None = None
    focus_topics: list[str] | None = None
    avoid_topics: list[str] | None = None
    response_depth: Literal["brief", "moderate", "detailed"] | None = None


# --- Request: atualizar status ---

class UpdatePatientStatusRequest(BaseModel):
    status: Literal["active", "paused", "discharged"]


# --- Request: atualizar limite de mensagens ---

class UpdateMessageLimitRequest(BaseModel):
    messages_limit: int


# --- Request: criar sessao ---

class CreateSessionRequest(BaseModel):
    date: str
    summary: str
    mood: Literal["very_low", "low", "neutral", "good", "great"]
    topics_covered: list[str] = []
    homework: str | None = None
    next_session_date: str | None = None


# --- Response: lista de sessoes ---

class SessionListResponse(BaseModel):
    sessions: list[TherapySession]
    total: int
