"""Endpoints do Dashboard do Psicólogo (Fase 1 — dados persistidos em JSON)."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user_id  # TODO Fase 2: adicionar require_therapist_role
from app.core.storage import read_json, write_json
from app.domain.therapist.schemas import (
    CreateSessionRequest,
    DashboardOverview,
    NearLimitPatient,
    PatientConfig,
    PatientIntakeForm,
    PatientListResponse,
    PatientSummary,
    RecentActivity,
    SessionListResponse,
    TherapySession,
    UpdateMessageLimitRequest,
    UpdatePatientConfigRequest,
    UpdatePatientStatusRequest,
)

router = APIRouter(prefix="/therapist", tags=["Therapist"])

PATIENTS_FILE = "patients.json"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _gen_id(prefix: str = "pat") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


# ── Dados mock iniciais ─────────────────────────────────────────────────────

MOCK_PATIENTS: list[dict] = [
    {
        "id": "pat-001",
        "name": "Ana Beatriz Souza",
        "email": "ana.beatriz@email.com",
        "status": "active",
        "created_at": "2025-09-10T08:00:00Z",
        "chief_complaint": "Ansiedade frequente e dificuldade para dormir",
        "anxiety_level": "moderate",
        "depression_level": "mild",
        "sleep_quality": "poor",
        "suicidal_ideation": False,
        "current_medication": "Sertralina 50mg",
        "therapy_goal": "Desenvolver estratégias de enfrentamento para ansiedade",
        "therapeutic_approach": "Terapia Cognitivo-Comportamental",
        "focus_topics": ["ansiedade", "sono", "autoestima"],
        "avoid_topics": [],
        "response_depth": "moderate",
        "messages_used": 87,
        "messages_limit": 100,
        "sessions": [
            {
                "id": "sess-001",
                "patient_id": "pat-001",
                "date": "2025-11-01",
                "summary": "Paciente relata melhora na qualidade do sono após exercícios de respiração.",
                "mood": "good",
                "topics_covered": ["sono", "respiração", "rotina"],
                "homework": "Praticar respiração diafragmática antes de dormir",
                "next_session_date": "2025-11-15",
                "created_at": "2025-11-01T14:00:00Z",
            },
            {
                "id": "sess-002",
                "patient_id": "pat-001",
                "date": "2025-11-15",
                "summary": "Discutimos gatilhos de ansiedade no trabalho. Reestruturação cognitiva aplicada.",
                "mood": "neutral",
                "topics_covered": ["ansiedade", "trabalho", "pensamentos automáticos"],
                "homework": "Diário de pensamentos automáticos",
                "next_session_date": "2025-11-29",
                "created_at": "2025-11-15T14:00:00Z",
            },
        ],
    },
    {
        "id": "pat-002",
        "name": "Pedro Henrique Lima",
        "email": "pedro.lima@email.com",
        "status": "paused",
        "created_at": "2025-08-20T10:00:00Z",
        "chief_complaint": "Luto pela perda de familiar",
        "anxiety_level": "mild",
        "depression_level": "moderate",
        "sleep_quality": "fair",
        "suicidal_ideation": False,
        "current_medication": None,
        "therapy_goal": "Elaboração do luto e fortalecimento emocional",
        "therapeutic_approach": "Abordagem Humanista",
        "focus_topics": ["luto", "família", "espiritualidade"],
        "avoid_topics": ["detalhes do falecimento"],
        "response_depth": "detailed",
        "messages_used": 42,
        "messages_limit": 200,
        "sessions": [
            {
                "id": "sess-003",
                "patient_id": "pat-002",
                "date": "2025-10-05",
                "summary": "Sessão focada em memórias positivas do familiar. Paciente chorou mas sentiu alívio.",
                "mood": "low",
                "topics_covered": ["luto", "memórias", "aceitação"],
                "homework": "Escrever carta para o familiar",
                "next_session_date": "2025-10-19",
                "created_at": "2025-10-05T10:00:00Z",
            },
        ],
    },
    {
        "id": "pat-003",
        "name": "Maria Clara Santos",
        "email": "maria.clara@email.com",
        "status": "active",
        "created_at": "2025-10-01T09:00:00Z",
        "chief_complaint": "Baixa autoestima e dificuldade em relacionamentos",
        "anxiety_level": "mild",
        "depression_level": "none",
        "sleep_quality": "good",
        "suicidal_ideation": False,
        "current_medication": None,
        "therapy_goal": "Fortalecer autoestima e melhorar comunicação interpessoal",
        "therapeutic_approach": "Terapia Cognitivo-Comportamental",
        "focus_topics": ["autoestima", "relacionamentos", "comunicação"],
        "avoid_topics": [],
        "response_depth": "brief",
        "messages_used": 15,
        "messages_limit": 50,
        "sessions": [
            {
                "id": "sess-004",
                "patient_id": "pat-003",
                "date": "2025-10-15",
                "summary": "Primeira sessão. Anamnese inicial e estabelecimento de vínculo terapêutico.",
                "mood": "neutral",
                "topics_covered": ["anamnese", "expectativas", "vínculo"],
                "homework": None,
                "next_session_date": "2025-10-29",
                "created_at": "2025-10-15T09:00:00Z",
            },
            {
                "id": "sess-005",
                "patient_id": "pat-003",
                "date": "2025-10-29",
                "summary": "Trabalhamos crenças centrais sobre autoestima. Paciente engajada.",
                "mood": "good",
                "topics_covered": ["autoestima", "crenças centrais", "autoconhecimento"],
                "homework": "Listar 3 qualidades pessoais diariamente",
                "next_session_date": "2025-11-12",
                "created_at": "2025-10-29T09:00:00Z",
            },
            {
                "id": "sess-006",
                "patient_id": "pat-003",
                "date": "2025-11-12",
                "summary": "Revisão do exercício de qualidades. Paciente relatou melhora significativa.",
                "mood": "great",
                "topics_covered": ["autoestima", "progresso", "assertividade"],
                "homework": "Praticar comunicação assertiva em uma situação social",
                "next_session_date": "2025-11-26",
                "created_at": "2025-11-12T09:00:00Z",
            },
        ],
    },
]


# ── Helpers de persistência ──────────────────────────────────────────────────

def _load_patients() -> list[dict]:
    data = read_json(PATIENTS_FILE)
    if not data:
        write_json(PATIENTS_FILE, MOCK_PATIENTS)
        return list(MOCK_PATIENTS)
    if isinstance(data, list):
        return data
    return MOCK_PATIENTS


def _save_patients(patients: list[dict]) -> None:
    write_json(PATIENTS_FILE, patients)


def _find_patient(patients: list[dict], patient_id: str) -> dict:
    for p in patients:
        if p["id"] == patient_id:
            return p
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paciente não encontrado")


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/overview", response_model=DashboardOverview)
def get_overview(user_id: str = Depends(get_current_user_id)) -> DashboardOverview:
    """Retorna visão geral do dashboard do psicólogo."""
    patients = _load_patients()

    active = [p for p in patients if p["status"] == "active"]
    paused = [p for p in patients if p["status"] == "paused"]
    discharged = [p for p in patients if p["status"] == "discharged"]

    threshold = 0.8
    near_limit = [
        NearLimitPatient(
            id=p["id"],
            name=p["name"],
            messages_used=p["messages_used"],
            messages_limit=p["messages_limit"],
        )
        for p in patients
        if p["messages_limit"] > 0 and p["messages_used"] / p["messages_limit"] >= threshold
    ]

    recent = [
        RecentActivity(patient_name=p["name"], action="Sessão registrada", timestamp=p["created_at"])
        for p in sorted(patients, key=lambda x: x["created_at"], reverse=True)[:5]
    ]

    return DashboardOverview(
        total_patients=len(patients),
        active_patients=len(active),
        paused_patients=len(paused),
        discharged_patients=len(discharged),
        near_limit_patients=near_limit,
        recent_activity=recent,
    )


@router.get("/patients", response_model=PatientListResponse)
def list_patients(user_id: str = Depends(get_current_user_id)) -> PatientListResponse:
    """Lista todos os pacientes (versão resumida, sem sessões)."""
    patients = _load_patients()
    summaries = [
        PatientSummary(
            id=p["id"],
            name=p["name"],
            email=p["email"],
            status=p["status"],
            messages_used=p["messages_used"],
            messages_limit=p["messages_limit"],
            created_at=p["created_at"],
        )
        for p in patients
    ]
    return PatientListResponse(patients=summaries, total=len(summaries))


@router.post("/patients", response_model=PatientConfig, status_code=201)
def create_patient(
    body: PatientIntakeForm,
    user_id: str = Depends(get_current_user_id),
) -> PatientConfig:
    """Cadastra novo paciente via formulário de intake."""
    patients = _load_patients()
    patient_id = _gen_id()
    now = _now_iso()

    new_patient: dict = {
        "id": patient_id,
        "name": body.name,
        "email": body.email,
        "status": "active",
        "created_at": now,
        "chief_complaint": body.chief_complaint,
        "anxiety_level": body.anxiety_level,
        "depression_level": body.depression_level,
        "sleep_quality": body.sleep_quality,
        "suicidal_ideation": body.suicidal_ideation,
        "current_medication": body.current_medication,
        "therapy_goal": body.therapy_goal,
        "therapeutic_approach": body.therapeutic_approach,
        "focus_topics": body.focus_topics,
        "avoid_topics": body.avoid_topics,
        "response_depth": body.response_depth,
        "messages_used": 0,
        "messages_limit": body.messages_limit,
        "sessions": [],
    }

    if body.first_session_date:
        session = {
            "id": _gen_id("sess"),
            "patient_id": patient_id,
            "date": body.first_session_date,
            "summary": body.first_session_summary or "",
            "mood": body.first_session_mood or "neutral",
            "topics_covered": [],
            "homework": None,
            "next_session_date": None,
            "created_at": now,
        }
        new_patient["sessions"].append(session)

    patients.append(new_patient)
    _save_patients(patients)
    return PatientConfig(**new_patient)


@router.get("/patients/{patient_id}", response_model=PatientConfig)
def get_patient(
    patient_id: str,
    user_id: str = Depends(get_current_user_id),
) -> PatientConfig:
    """Retorna ficha completa de um paciente."""
    patients = _load_patients()
    patient = _find_patient(patients, patient_id)
    return PatientConfig(**patient)


@router.patch("/patients/{patient_id}", response_model=PatientConfig)
def update_patient(
    patient_id: str,
    body: UpdatePatientConfigRequest,
    user_id: str = Depends(get_current_user_id),
) -> PatientConfig:
    """Atualiza dados clínicos e diretrizes de um paciente."""
    patients = _load_patients()
    patient = _find_patient(patients, patient_id)
    updates = body.model_dump(exclude_unset=True)
    patient.update(updates)
    _save_patients(patients)
    return PatientConfig(**patient)


@router.patch("/patients/{patient_id}/status", response_model=PatientConfig)
def update_patient_status(
    patient_id: str,
    body: UpdatePatientStatusRequest,
    user_id: str = Depends(get_current_user_id),
) -> PatientConfig:
    """Altera o status do paciente (active, paused, discharged)."""
    patients = _load_patients()
    patient = _find_patient(patients, patient_id)
    patient["status"] = body.status
    _save_patients(patients)
    return PatientConfig(**patient)


@router.patch("/patients/{patient_id}/limit", response_model=PatientConfig)
def update_patient_limit(
    patient_id: str,
    body: UpdateMessageLimitRequest,
    user_id: str = Depends(get_current_user_id),
) -> PatientConfig:
    """Ajusta o limite de mensagens do paciente."""
    patients = _load_patients()
    patient = _find_patient(patients, patient_id)
    patient["messages_limit"] = body.messages_limit
    _save_patients(patients)
    return PatientConfig(**patient)


@router.get("/patients/{patient_id}/sessions", response_model=SessionListResponse)
def list_sessions(
    patient_id: str,
    user_id: str = Depends(get_current_user_id),
) -> SessionListResponse:
    """Lista sessões terapêuticas de um paciente."""
    patients = _load_patients()
    patient = _find_patient(patients, patient_id)
    sessions = patient.get("sessions", [])
    return SessionListResponse(
        sessions=[TherapySession(**s) for s in sessions],
        total=len(sessions),
    )


@router.post("/patients/{patient_id}/sessions", response_model=TherapySession, status_code=201)
def create_session(
    patient_id: str,
    body: CreateSessionRequest,
    user_id: str = Depends(get_current_user_id),
) -> TherapySession:
    """Registra nova sessão terapêutica."""
    patients = _load_patients()
    patient = _find_patient(patients, patient_id)

    session_data = {
        "id": _gen_id("sess"),
        "patient_id": patient_id,
        "created_at": _now_iso(),
        **body.model_dump(),
    }
    patient.setdefault("sessions", []).append(session_data)
    _save_patients(patients)
    return TherapySession(**session_data)


@router.patch("/patients/{patient_id}/sessions/{session_id}", response_model=TherapySession)
def update_session(
    patient_id: str,
    session_id: str,
    body: CreateSessionRequest,
    user_id: str = Depends(get_current_user_id),
) -> TherapySession:
    """Atualiza uma sessão terapêutica existente."""
    patients = _load_patients()
    patient = _find_patient(patients, patient_id)

    for session in patient.get("sessions", []):
        if session["id"] == session_id:
            session.update(body.model_dump())
            _save_patients(patients)
            return TherapySession(**session)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sessão não encontrada")
