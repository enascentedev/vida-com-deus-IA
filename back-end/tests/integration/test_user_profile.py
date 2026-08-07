"""Integração: perfil e configurações persistidas do usuário autenticado."""

import pytest

from tests.conftest import auth_headers, signup_user

pytestmark = pytest.mark.db


async def test_atualiza_perfil_e_persiste_configuracoes(client):
    tokens, _, _ = await signup_user(client)
    headers = auth_headers(tokens)

    profile = await client.patch(
        "/v1/users/me",
        headers=headers,
        json={"name": "Nome Atualizado", "avatar_url": "https://example.com/avatar.png"},
    )
    assert profile.status_code == 200
    assert profile.json()["name"] == "Nome Atualizado"
    assert profile.json()["avatar_url"] == "https://example.com/avatar.png"

    defaults = await client.get("/v1/users/me/settings", headers=headers)
    existing = await client.get("/v1/users/me/settings", headers=headers)
    updated = await client.patch(
        "/v1/users/me/settings",
        headers=headers,
        json={"theme": "dark", "ai_insights": False, "rag_memory": True},
    )

    assert defaults.status_code == 200
    assert defaults.json()["theme"] == "system"
    assert existing.json() == defaults.json()
    assert updated.status_code == 200
    assert updated.json()["theme"] == "dark"
    assert updated.json()["ai_insights"] is False
    assert updated.json()["rag_memory"] is True
