"""
Testes de contrato (Fase 2) — validam que todos os endpoints retornam
status HTTP correto e schemas aderentes ao OpenAPI.

Usa dependency_overrides para evitar dependência de banco ou token real.
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.dependencies import get_current_user_id
from app.core.database import get_db
from app.domain.auth.schemas import MessageResponse, TokenPair
from app.domain.chat.schemas import (
    ChatMessage as ChatMessageSchema,
    Conversation,
    ConversationListResponse,
    MessagesResponse,
    SendMessageResponse,
)
from app.domain.library.schemas import FavoriteToggleResponse, LibraryResponse
from app.domain.posts.schemas import (
    AudioResponse,
    FeedResponse,
    PostDetail,
    PostKeyPoint,
    PostSummary,
)
from app.main import app

FAKE_USER_ID = str(uuid.uuid4())

# Sobrescreve a dependência de autenticação para os testes de contrato
app.dependency_overrides[get_current_user_id] = lambda: FAKE_USER_ID

# Mock de sessão do banco — endpoints que usam get_db diretamente (auth)
_mock_db = AsyncMock()
app.dependency_overrides[get_db] = lambda: _mock_db

client = TestClient(app)
AUTH_HEADER = {"Authorization": "Bearer token-de-teste"}

# Token pair falso para testes de auth
_FAKE_TOKEN_PAIR = TokenPair(
    access_token="fake-access-token",
    refresh_token="fake-refresh-token",
)

# Objetos fake para library
_FAKE_LIBRARY_EMPTY = LibraryResponse(items=[], total=0)
_FAKE_FAV_ADDED = FavoriteToggleResponse(
    post_id="post-001", is_favorited=True, message="Post adicionado aos favoritos."
)
_FAKE_FAV_REMOVED = FavoriteToggleResponse(
    post_id="post-001", is_favorited=False, message="Post removido dos favoritos."
)
_FAKE_HISTORY_MSG = MessageResponse(message="Acesso registrado.")

# Objetos fake para chat
_FAKE_CONV_ID = str(uuid.uuid4())
_FAKE_CONVERSATION = Conversation(
    id=_FAKE_CONV_ID,
    user_id=FAKE_USER_ID,
    created_at="2026-02-21T00:00:00",
    message_count=0,
)
_FAKE_CONV_LIST = ConversationListResponse(conversations=[_FAKE_CONVERSATION])
_FAKE_MSG_USER = ChatMessageSchema(
    id=str(uuid.uuid4()),
    role="user",
    content="O que a Bíblia diz sobre esperança?",
    citations=[],
    created_at="2026-02-21T00:00:00",
)
_FAKE_MSG_ASSISTANT = ChatMessageSchema(
    id=str(uuid.uuid4()),
    role="assistant",
    content="A Bíblia fala muito sobre esperança.",
    citations=[],
    created_at="2026-02-21T00:00:00",
)
_FAKE_MESSAGES = MessagesResponse(
    conversation_id=_FAKE_CONV_ID,
    messages=[_FAKE_MSG_USER],
)
_FAKE_SEND_RESPONSE = SendMessageResponse(
    user_message=_FAKE_MSG_USER,
    assistant_message=_FAKE_MSG_ASSISTANT,
)


# ─── Health ──────────────────────────────────────────────────────────────────

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "version" in body


# ─── Auth ─────────────────────────────────────────────────────────────────────

@patch("app.api.v1.auth.auth_service.signup", new_callable=AsyncMock, return_value=_FAKE_TOKEN_PAIR)
def test_signup(mock_signup):
    r = client.post("/v1/auth/signup", json={
        "name": "João Silva",
        "email": "joao@exemplo.com",
        "password": "senha123",
    })
    assert r.status_code == 201
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


@patch("app.api.v1.auth.auth_service.login", new_callable=AsyncMock, return_value=_FAKE_TOKEN_PAIR)
def test_login(mock_login):
    r = client.post("/v1/auth/login", json={
        "email": "joao@exemplo.com",
        "password": "senha123",
    })
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" in body


@patch("app.api.v1.auth.auth_service.refresh", new_callable=AsyncMock, return_value=_FAKE_TOKEN_PAIR)
def test_refresh(mock_refresh):
    r = client.post("/v1/auth/refresh", json={"refresh_token": "any-token"})
    assert r.status_code == 200
    assert "access_token" in r.json()


@patch("app.api.v1.auth.auth_service.forgot_password", new_callable=AsyncMock, return_value=None)
def test_forgot_password(mock_forgot):
    r = client.post("/v1/auth/forgot-password", json={"email": "joao@exemplo.com"})
    assert r.status_code == 200
    assert "message" in r.json()


@patch("app.api.v1.auth.auth_service.reset_password", new_callable=AsyncMock, return_value=None)
def test_reset_password(mock_reset):
    r = client.post("/v1/auth/reset-password", json={
        "token": "reset-token-123",
        "new_password": "nova-senha-456",
    })
    assert r.status_code == 200
    assert "message" in r.json()


@patch("app.api.v1.auth.auth_service.logout", new_callable=AsyncMock, return_value=None)
def test_logout(mock_logout):
    r = client.post("/v1/auth/logout", headers=AUTH_HEADER)
    assert r.status_code == 200
    assert "message" in r.json()


# ─── Users ───────────────────────────────────────────────────────────────────

@patch("app.api.v1.users.user_service.get_me", new_callable=AsyncMock)
def test_get_me(mock_get_me):
    mock_get_me.return_value = {
        "id": FAKE_USER_ID, "name": "Gabriel Santos",
        "email": "gabriel@vidacomdeus.com", "plan": "free",
    }
    r = client.get("/v1/users/me", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "id" in body
    assert "name" in body
    assert "email" in body


@patch("app.api.v1.users.user_service.update_me", new_callable=AsyncMock)
def test_update_me(mock_update):
    mock_update.return_value = {
        "id": FAKE_USER_ID, "name": "Gabriel S.",
        "email": "gabriel@vidacomdeus.com", "plan": "free",
    }
    r = client.patch("/v1/users/me", json={"name": "Gabriel S."}, headers=AUTH_HEADER)
    assert r.status_code == 200
    assert r.json()["name"] == "Gabriel S."


@patch("app.api.v1.users.user_service.get_settings", new_callable=AsyncMock)
def test_get_settings(mock_settings):
    mock_settings.return_value = {
        "theme": "system", "ai_insights": True,
        "biblical_reminders": True, "rag_memory": False,
    }
    r = client.get("/v1/users/me/settings", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "theme" in body
    assert "ai_insights" in body
    assert "biblical_reminders" in body
    assert "rag_memory" in body


@patch("app.api.v1.users.user_service.update_settings", new_callable=AsyncMock)
def test_update_settings(mock_update):
    mock_update.return_value = {
        "theme": "dark", "ai_insights": True,
        "biblical_reminders": True, "rag_memory": False,
    }
    r = client.patch("/v1/users/me/settings", json={"theme": "dark"}, headers=AUTH_HEADER)
    assert r.status_code == 200
    assert r.json()["theme"] == "dark"


# ─── Posts ───────────────────────────────────────────────────────────────────

_FAKE_POST_ID = str(uuid.uuid4())

_FAKE_POST_SUMMARY = PostSummary(
    id=_FAKE_POST_ID,
    title="Encontrando Paz no Meio do Caos",
    reference="Salmos 23:1",
    category="Post do Dia",
    date="24 de Maio, 2024",
    thumbnail_url="https://example.com/img.jpg",
    is_new=True,
    tags=["Paz", "Fé", "Salmos"],
)

_FAKE_FEED = FeedResponse(
    post_of_day=_FAKE_POST_SUMMARY,
    recent_posts=[_FAKE_POST_SUMMARY],
)

_FAKE_POST_DETAIL = PostDetail(
    id=_FAKE_POST_ID,
    title="Encontrando Paz no Meio do Caos",
    reference="Salmos 23:1",
    category="Post do Dia",
    date="24 de Maio, 2024",
    verse_content="O Senhor é meu pastor, nada me faltará.",
    ai_summary="Resumo do post.",
    key_points=[PostKeyPoint(text="Ponto chave de teste")],
    tags=["Paz", "Fé"],
    devotional_meditation="Meditação de teste.",
    devotional_prayer="Oração de teste.",
    audio_url="https://example.com/audio.mp3",
    audio_duration="5:00",
)

_FAKE_AUDIO = AudioResponse(
    post_id=_FAKE_POST_ID,
    url="https://example.com/audio.mp3",
    duration="5:00",
    title="Encontrando Paz no Meio do Caos",
)


@patch("app.services.post_service.PostService.get_feed", new_callable=AsyncMock, return_value=_FAKE_FEED)
def test_get_feed(mock_feed):
    r = client.get("/v1/posts/feed", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "post_of_day" in body
    assert "recent_posts" in body
    assert isinstance(body["recent_posts"], list)


@patch("app.services.post_service.PostService.list_posts", new_callable=AsyncMock, return_value=[_FAKE_POST_SUMMARY])
def test_list_posts(mock_list):
    r = client.get("/v1/posts", headers=AUTH_HEADER)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@patch("app.services.post_service.PostService.list_posts", new_callable=AsyncMock, return_value=[_FAKE_POST_SUMMARY])
def test_list_posts_with_query(mock_list):
    r = client.get("/v1/posts?query=Paz", headers=AUTH_HEADER)
    assert r.status_code == 200
    results = r.json()
    assert all("Paz" in p["title"] or "paz" in p["title"].lower() for p in results)


@patch("app.services.post_service.PostService.get_post_detail", new_callable=AsyncMock, return_value=_FAKE_POST_DETAIL)
def test_get_post_detail(mock_detail):
    r = client.get(f"/v1/posts/{_FAKE_POST_ID}", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "title" in body
    assert "verse_content" in body
    assert "ai_summary" in body
    assert "tags" in body
    assert isinstance(body["key_points"], list)


@patch("app.services.post_service.PostService.get_post_audio", new_callable=AsyncMock, return_value=_FAKE_AUDIO)
def test_get_post_audio(mock_audio):
    r = client.get(f"/v1/posts/{_FAKE_POST_ID}/audio", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "url" in body
    assert "duration" in body


# ─── Library ─────────────────────────────────────────────────────────────────

@patch("app.services.library_service.LibraryService.get_library", new_callable=AsyncMock, return_value=_FAKE_LIBRARY_EMPTY)
def test_get_favorites(mock_get):
    r = client.get("/v1/library?tab=favorites", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "items" in body
    assert "total" in body
    assert isinstance(body["items"], list)


@patch("app.services.library_service.LibraryService.get_library", new_callable=AsyncMock, return_value=_FAKE_LIBRARY_EMPTY)
def test_get_history(mock_get):
    r = client.get("/v1/library?tab=history", headers=AUTH_HEADER)
    assert r.status_code == 200
    assert isinstance(r.json()["items"], list)


@patch("app.services.library_service.LibraryService.add_favorite", new_callable=AsyncMock, return_value=_FAKE_FAV_ADDED)
def test_add_favorite(mock_add):
    r = client.post("/v1/library/favorites/post-001", headers=AUTH_HEADER)
    assert r.status_code == 201
    body = r.json()
    assert body["is_favorited"] is True
    assert body["post_id"] == "post-001"


@patch("app.services.library_service.LibraryService.remove_favorite", new_callable=AsyncMock, return_value=_FAKE_FAV_REMOVED)
def test_remove_favorite(mock_remove):
    r = client.delete("/v1/library/favorites/post-001", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert body["is_favorited"] is False


@patch("app.services.library_service.LibraryService.record_history", new_callable=AsyncMock, return_value=_FAKE_HISTORY_MSG)
def test_record_history(mock_history):
    r = client.post("/v1/library/history", json={"post_id": "post-001"}, headers=AUTH_HEADER)
    assert r.status_code == 201
    assert "message" in r.json()


# ─── Chat ─────────────────────────────────────────────────────────────────────

@patch("app.services.chat_service.ChatService.create_conversation", new_callable=AsyncMock, return_value=_FAKE_CONVERSATION)
def test_create_conversation(mock_create):
    r = client.post("/v1/chat/conversations", headers=AUTH_HEADER)
    assert r.status_code == 201
    body = r.json()
    assert "id" in body
    assert "user_id" in body


@patch("app.services.chat_service.ChatService.list_conversations", new_callable=AsyncMock, return_value=_FAKE_CONV_LIST)
def test_list_conversations(mock_list):
    r = client.get("/v1/chat/conversations", headers=AUTH_HEADER)
    assert r.status_code == 200
    assert "conversations" in r.json()


@patch("app.services.chat_service.ChatService.get_messages", new_callable=AsyncMock, return_value=_FAKE_MESSAGES)
def test_get_messages(mock_get):
    r = client.get("/v1/chat/conversations/conv-001/messages", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "conversation_id" in body
    assert "messages" in body
    msgs = body["messages"]
    assert len(msgs) >= 1
    assert msgs[0]["role"] in ("user", "assistant")


@patch("app.services.chat_service.ChatService.send_message", new_callable=AsyncMock, return_value=_FAKE_SEND_RESPONSE)
def test_send_message(mock_send):
    r = client.post(
        "/v1/chat/conversations/conv-001/messages",
        json={"content": "O que a Bíblia diz sobre esperança?"},
        headers=AUTH_HEADER,
    )
    assert r.status_code == 201
    body = r.json()
    assert "user_message" in body
    assert "assistant_message" in body
    ai = body["assistant_message"]
    assert ai["role"] == "assistant"
    assert isinstance(ai["citations"], list)


# ─── Therapist ────────────────────────────────────────────────────────────────

def test_therapist_overview():
    r = client.get("/v1/therapist/overview", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "total_patients" in body
    assert "active_patients" in body
    assert "paused_patients" in body
    assert "discharged_patients" in body
    assert isinstance(body["near_limit_patients"], list)
    assert isinstance(body["recent_activity"], list)


def test_therapist_list_patients():
    r = client.get("/v1/therapist/patients", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "patients" in body
    assert "total" in body
    assert isinstance(body["patients"], list)
    assert body["total"] >= 1
    p = body["patients"][0]
    assert "id" in p
    assert "name" in p
    assert "email" in p
    assert "status" in p
    assert "sessions" not in p  # PatientSummary nao inclui sessions


def test_therapist_create_patient():
    r = client.post("/v1/therapist/patients", json={
        "name": "Teste Criação",
        "email": "teste@email.com",
        "chief_complaint": "Queixa de teste",
        "anxiety_level": "mild",
        "messages_limit": 50,
    }, headers=AUTH_HEADER)
    assert r.status_code == 201
    body = r.json()
    assert body["name"] == "Teste Criação"
    assert body["email"] == "teste@email.com"
    assert body["status"] == "active"
    assert body["messages_limit"] == 50
    assert "id" in body
    assert "sessions" in body


def test_therapist_create_patient_with_first_session():
    r = client.post("/v1/therapist/patients", json={
        "name": "Com Sessão",
        "email": "sessao@email.com",
        "first_session_date": "2025-12-01",
        "first_session_summary": "Sessão inicial",
        "first_session_mood": "good",
    }, headers=AUTH_HEADER)
    assert r.status_code == 201
    body = r.json()
    assert len(body["sessions"]) == 1
    assert body["sessions"][0]["mood"] == "good"


def test_therapist_create_patient_invalid_email():
    r = client.post("/v1/therapist/patients", json={
        "name": "Email Inválido",
        "email": "nao-e-email",
    }, headers=AUTH_HEADER)
    assert r.status_code == 422


def test_therapist_create_patient_missing_name():
    r = client.post("/v1/therapist/patients", json={
        "email": "teste@email.com",
    }, headers=AUTH_HEADER)
    assert r.status_code == 422


def test_therapist_get_patient():
    r = client.get("/v1/therapist/patients/pat-001", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert body["id"] == "pat-001"
    assert "sessions" in body
    assert isinstance(body["sessions"], list)


def test_therapist_get_patient_not_found():
    r = client.get("/v1/therapist/patients/inexistente", headers=AUTH_HEADER)
    assert r.status_code == 404


def test_therapist_update_patient():
    r = client.patch("/v1/therapist/patients/pat-001", json={
        "therapy_goal": "Meta atualizada via teste",
    }, headers=AUTH_HEADER)
    assert r.status_code == 200
    assert r.json()["therapy_goal"] == "Meta atualizada via teste"


def test_therapist_update_patient_invalid_anxiety():
    r = client.patch("/v1/therapist/patients/pat-001", json={
        "anxiety_level": "inexistente",
    }, headers=AUTH_HEADER)
    assert r.status_code == 422


def test_therapist_update_status():
    r = client.patch("/v1/therapist/patients/pat-001/status", json={
        "status": "paused",
    }, headers=AUTH_HEADER)
    assert r.status_code == 200
    assert r.json()["status"] == "paused"
    # Restaurar status
    client.patch("/v1/therapist/patients/pat-001/status", json={
        "status": "active",
    }, headers=AUTH_HEADER)


def test_therapist_update_status_invalid():
    r = client.patch("/v1/therapist/patients/pat-001/status", json={
        "status": "invalido",
    }, headers=AUTH_HEADER)
    assert r.status_code == 422


def test_therapist_update_limit():
    r = client.patch("/v1/therapist/patients/pat-001/limit", json={
        "messages_limit": 250,
    }, headers=AUTH_HEADER)
    assert r.status_code == 200
    assert r.json()["messages_limit"] == 250


def test_therapist_list_sessions():
    r = client.get("/v1/therapist/patients/pat-001/sessions", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "sessions" in body
    assert "total" in body
    assert isinstance(body["sessions"], list)


def test_therapist_list_sessions_not_found():
    r = client.get("/v1/therapist/patients/inexistente/sessions", headers=AUTH_HEADER)
    assert r.status_code == 404


def test_therapist_create_session():
    r = client.post("/v1/therapist/patients/pat-001/sessions", json={
        "date": "2025-12-01",
        "summary": "Sessão de teste",
        "mood": "great",
        "topics_covered": ["teste"],
        "homework": "Tarefa de teste",
    }, headers=AUTH_HEADER)
    assert r.status_code == 201
    body = r.json()
    assert body["mood"] == "great"
    assert body["patient_id"] == "pat-001"
    assert "id" in body


def test_therapist_create_session_invalid_mood():
    r = client.post("/v1/therapist/patients/pat-001/sessions", json={
        "date": "2025-12-01",
        "summary": "Teste",
        "mood": "invalido",
    }, headers=AUTH_HEADER)
    assert r.status_code == 422


def test_therapist_create_session_missing_fields():
    r = client.post("/v1/therapist/patients/pat-001/sessions", json={
        "date": "2025-12-01",
    }, headers=AUTH_HEADER)
    assert r.status_code == 422


def test_therapist_update_session():
    # Pega uma sessão existente
    sessions_r = client.get("/v1/therapist/patients/pat-001/sessions", headers=AUTH_HEADER)
    session_id = sessions_r.json()["sessions"][0]["id"]

    r = client.patch(f"/v1/therapist/patients/pat-001/sessions/{session_id}", json={
        "date": "2025-12-15",
        "summary": "Sessão editada via teste",
        "mood": "neutral",
    }, headers=AUTH_HEADER)
    assert r.status_code == 200
    assert r.json()["summary"] == "Sessão editada via teste"


def test_therapist_update_session_not_found():
    r = client.patch("/v1/therapist/patients/pat-001/sessions/inexistente", json={
        "date": "2025-12-15",
        "summary": "Não existe",
        "mood": "neutral",
    }, headers=AUTH_HEADER)
    assert r.status_code == 404


# ─── Admin ───────────────────────────────────────────────────────────────────

def test_get_storage_metrics():
    r = client.get("/v1/admin/metrics/storage", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "usage_percent" in body
    assert "used_gb" in body
    assert "total_gb" in body


def test_get_growth_metrics():
    r = client.get("/v1/admin/metrics/growth", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "percentage" in body
    assert "history" in body
    assert len(body["history"]) == 7


def test_get_etl_runs():
    r = client.get("/v1/admin/etl/runs", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "runs" in body
    assert len(body["runs"]) >= 1
    run = body["runs"][0]
    assert run["status"] in ("success", "failed", "running", "pending")


@patch("app.api.v1.admin.run_etl", new_callable=AsyncMock, return_value={
    "status": "success",
    "started_at": "2026-02-21T00:00:00Z",
    "finished_at": "2026-02-21T00:00:05Z",
    "posts_collected": 5,
    "new_posts": 3,
    "message": "5 reflexões coletadas (3 novas)",
})
def test_execute_etl(mock_etl):
    r = client.post("/v1/admin/etl/runs/execute", headers=AUTH_HEADER)
    assert r.status_code == 202
    body = r.json()
    assert "run_id" in body
    assert body["status"] in ("success", "running")


def test_get_alerts():
    r = client.get("/v1/admin/alerts", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "alerts" in body
    assert len(body["alerts"]) >= 1
    alert = body["alerts"][0]
    assert alert["level"] in ("info", "warning", "error", "critical")
