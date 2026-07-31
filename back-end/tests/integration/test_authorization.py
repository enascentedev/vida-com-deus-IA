"""Integração: isolamento entre usuários e exigência de autenticação."""

import pytest

from tests.conftest import auth_headers, signup_user

pytestmark = pytest.mark.db


async def test_rota_protegida_sem_token_da_401(client):
    r = await client.get("/v1/users/me")
    assert r.status_code == 401


async def test_rota_protegida_com_token_invalido_da_401(client):
    r = await client.get("/v1/users/me", headers={"Authorization": "Bearer token-invalido"})
    assert r.status_code == 401


async def test_usuario_acessa_o_proprio_perfil(client):
    tokens, email, _ = await signup_user(client)
    r = await client.get("/v1/users/me", headers=auth_headers(tokens))
    assert r.status_code == 200
    assert r.json()["email"] == email


async def test_conversa_de_outro_usuario_e_invisivel(client):
    tokens_a, _, _ = await signup_user(client)
    tokens_b, _, _ = await signup_user(client)

    r = await client.post("/v1/chat/conversations", headers=auth_headers(tokens_a))
    assert r.status_code == 201
    conv_id = r.json()["id"]

    # B não lê nem escreve na conversa de A — 404, sem confirmar que ela existe.
    r_get = await client.get(
        f"/v1/chat/conversations/{conv_id}/messages", headers=auth_headers(tokens_b)
    )
    assert r_get.status_code == 404

    r_post = await client.post(
        f"/v1/chat/conversations/{conv_id}/messages",
        json={"content": "invasão"},
        headers=auth_headers(tokens_b),
    )
    assert r_post.status_code == 404


async def test_conversa_inexistente_da_404(client):
    import uuid

    tokens, _, _ = await signup_user(client)
    r = await client.get(
        f"/v1/chat/conversations/{uuid.uuid4()}/messages", headers=auth_headers(tokens)
    )
    assert r.status_code == 404


async def test_listagem_so_traz_conversas_do_dono(client):
    tokens_a, _, _ = await signup_user(client)
    tokens_b, _, _ = await signup_user(client)

    await client.post("/v1/chat/conversations", headers=auth_headers(tokens_a))

    r = await client.get("/v1/chat/conversations", headers=auth_headers(tokens_b))
    assert r.status_code == 200
    assert r.json()["conversations"] == []
