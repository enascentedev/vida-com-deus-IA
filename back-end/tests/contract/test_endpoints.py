"""
Testes de contrato (Fase 1) — validam que todos os endpoints retornam
status HTTP correto e schemas aderentes ao OpenAPI.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

AUTH_HEADER = {"Authorization": "Bearer mock-token"}


# ─── Health ──────────────────────────────────────────────────────────────────

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "version" in body


# ─── Auth ─────────────────────────────────────────────────────────────────────

def test_signup():
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


def test_login():
    r = client.post("/v1/auth/login", json={
        "email": "joao@exemplo.com",
        "password": "senha123",
    })
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert "refresh_token" in body


def test_refresh():
    r = client.post("/v1/auth/refresh", json={"refresh_token": "any-token"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_forgot_password():
    r = client.post("/v1/auth/forgot-password", json={"email": "joao@exemplo.com"})
    assert r.status_code == 200
    assert "message" in r.json()


def test_reset_password():
    r = client.post("/v1/auth/reset-password", json={
        "token": "reset-token-123",
        "new_password": "nova-senha-456",
    })
    assert r.status_code == 200
    assert "message" in r.json()


def test_logout():
    r = client.post("/v1/auth/logout", headers=AUTH_HEADER)
    assert r.status_code == 200
    assert "message" in r.json()


# ─── Users ───────────────────────────────────────────────────────────────────

def test_get_me():
    r = client.get("/v1/users/me", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "id" in body
    assert "name" in body
    assert "email" in body


def test_update_me():
    r = client.patch("/v1/users/me", json={"name": "Gabriel S."}, headers=AUTH_HEADER)
    assert r.status_code == 200
    assert r.json()["name"] == "Gabriel S."


def test_get_settings():
    r = client.get("/v1/users/me/settings", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "theme" in body
    assert "ai_insights" in body
    assert "biblical_reminders" in body
    assert "rag_memory" in body


def test_update_settings():
    r = client.patch("/v1/users/me/settings", json={"theme": "dark"}, headers=AUTH_HEADER)
    assert r.status_code == 200
    assert r.json()["theme"] == "dark"


# ─── Posts ───────────────────────────────────────────────────────────────────

def test_get_feed():
    r = client.get("/v1/posts/feed", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "post_of_day" in body
    assert "recent_posts" in body
    assert isinstance(body["recent_posts"], list)


def test_list_posts():
    r = client.get("/v1/posts", headers=AUTH_HEADER)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_list_posts_with_query():
    r = client.get("/v1/posts?query=Paz", headers=AUTH_HEADER)
    assert r.status_code == 200
    results = r.json()
    assert all("Paz" in p["title"] or "paz" in p["title"].lower() for p in results)


def test_get_post_detail():
    r = client.get("/v1/posts/post-001", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "title" in body
    assert "verse_content" in body
    assert "ai_summary" in body
    assert "tags" in body
    assert isinstance(body["key_points"], list)


def test_get_post_audio():
    r = client.get("/v1/posts/post-001/audio", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "url" in body
    assert "duration" in body


# ─── Library ─────────────────────────────────────────────────────────────────

def test_get_favorites():
    r = client.get("/v1/library?tab=favorites", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "items" in body
    assert "total" in body
    assert isinstance(body["items"], list)


def test_get_history():
    r = client.get("/v1/library?tab=history", headers=AUTH_HEADER)
    assert r.status_code == 200
    assert isinstance(r.json()["items"], list)


def test_add_favorite():
    r = client.post("/v1/library/favorites/post-001", headers=AUTH_HEADER)
    assert r.status_code == 201
    body = r.json()
    assert body["is_favorited"] is True
    assert body["post_id"] == "post-001"


def test_remove_favorite():
    r = client.delete("/v1/library/favorites/post-001", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert body["is_favorited"] is False


def test_record_history():
    r = client.post("/v1/library/history", json={"post_id": "post-001"}, headers=AUTH_HEADER)
    assert r.status_code == 201
    assert "message" in r.json()


# ─── Chat ─────────────────────────────────────────────────────────────────────

def test_create_conversation():
    r = client.post("/v1/chat/conversations", headers=AUTH_HEADER)
    assert r.status_code == 201
    body = r.json()
    assert "id" in body
    assert "user_id" in body


def test_list_conversations():
    r = client.get("/v1/chat/conversations", headers=AUTH_HEADER)
    assert r.status_code == 200
    assert "conversations" in r.json()


def test_get_messages():
    r = client.get("/v1/chat/conversations/conv-001/messages", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "conversation_id" in body
    assert "messages" in body
    msgs = body["messages"]
    assert len(msgs) >= 1
    assert msgs[0]["role"] in ("user", "assistant")


def test_send_message():
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


def test_execute_etl():
    r = client.post("/v1/admin/etl/runs/execute", headers=AUTH_HEADER)
    assert r.status_code == 202
    body = r.json()
    assert "run_id" in body
    assert body["status"] == "running"


def test_get_alerts():
    r = client.get("/v1/admin/alerts", headers=AUTH_HEADER)
    assert r.status_code == 200
    body = r.json()
    assert "alerts" in body
    assert len(body["alerts"]) >= 1
    alert = body["alerts"][0]
    assert alert["level"] in ("info", "warning", "error", "critical")
