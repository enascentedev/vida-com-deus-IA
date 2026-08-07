"""Integração: rotação, revogação, reuso e logout de refresh tokens."""

import uuid

import pytest
from sqlalchemy import update

from app.models.user import RefreshToken, User
from tests.conftest import auth_headers, signup_user

pytestmark = pytest.mark.db


async def _refresh(client, refresh_token: str):
    return await client.post("/v1/auth/refresh", json={"refresh_token": refresh_token})


async def test_refresh_valido_emite_novo_par(client):
    tokens, _, _ = await signup_user(client)
    r = await _refresh(client, tokens["refresh_token"])
    assert r.status_code == 200
    novo = r.json()
    assert novo["access_token"] != tokens["access_token"]
    assert novo["refresh_token"] != tokens["refresh_token"]


async def test_access_usado_como_refresh_e_rejeitado(client):
    tokens, _, _ = await signup_user(client)
    r = await _refresh(client, tokens["access_token"])
    assert r.status_code == 401


async def test_refresh_usado_como_access_e_rejeitado(client):
    tokens, _, _ = await signup_user(client)
    r = await client.get(
        "/v1/users/me",
        headers={"Authorization": f"Bearer {tokens['refresh_token']}"},
    )
    assert r.status_code == 401


async def test_reuso_do_refresh_antigo_derruba_a_sessao(client):
    tokens, _, _ = await signup_user(client)

    # Rotação legítima…
    r1 = await _refresh(client, tokens["refresh_token"])
    assert r1.status_code == 200
    novo = r1.json()

    # …seguida da reapresentação do token antigo: reuso detectado.
    r2 = await _refresh(client, tokens["refresh_token"])
    assert r2.status_code == 401

    # A sessão inteira caiu — o token novo também deixou de valer.
    r3 = await _refresh(client, novo["refresh_token"])
    assert r3.status_code == 401


async def test_refresh_expirado_e_rejeitado(client, db_session):
    tokens, _, _ = await signup_user(client)

    # Expira o registro no banco — o JWT ainda é válido, mas a sessão não.
    await db_session.execute(update(RefreshToken).values(expires_at="2020-01-01T00:00:00+00:00"))
    await db_session.commit()

    r = await _refresh(client, tokens["refresh_token"])
    assert r.status_code == 401


async def test_refresh_de_usuario_desativado_e_rejeitado(client, db_session):
    tokens, email, _ = await signup_user(client)

    await db_session.execute(update(User).where(User.email == email).values(is_active=False))
    await db_session.commit()

    r = await _refresh(client, tokens["refresh_token"])
    assert r.status_code == 401


async def test_refresh_desconhecido_e_rejeitado(client):
    r = await _refresh(client, "token-inventado")
    assert r.status_code == 401


async def test_logout_revoga_a_sessao(client):
    tokens, _, _ = await signup_user(client)

    r = await client.post("/v1/auth/logout", json={"refresh_token": tokens["refresh_token"]})
    assert r.status_code == 200

    # O refresh da sessão revogada não funciona mais.
    r2 = await _refresh(client, tokens["refresh_token"])
    assert r2.status_code == 401


async def test_logout_e_idempotente(client):
    tokens, _, _ = await signup_user(client)
    body = {"refresh_token": tokens["refresh_token"]}

    r1 = await client.post("/v1/auth/logout", json=body)
    r2 = await client.post("/v1/auth/logout", json=body)
    assert r1.status_code == 200
    assert r2.status_code == 200


async def test_logout_sem_body_usa_o_access_token(client):
    tokens, _, _ = await signup_user(client)

    r = await client.post("/v1/auth/logout", headers=auth_headers(tokens))
    assert r.status_code == 200

    r2 = await _refresh(client, tokens["refresh_token"])
    assert r2.status_code == 401


async def test_logout_all_derruba_todas_as_sessoes(client):
    tokens, email, senha = await signup_user(client)

    # Segunda sessão via login.
    r_login = await client.post("/v1/auth/login", json={"email": email, "password": senha})
    assert r_login.status_code == 200
    sessao2 = r_login.json()

    r = await client.post("/v1/auth/logout-all", headers=auth_headers(tokens))
    assert r.status_code == 200

    assert (await _refresh(client, tokens["refresh_token"])).status_code == 401
    assert (await _refresh(client, sessao2["refresh_token"])).status_code == 401


async def test_refresh_token_nao_e_armazenado_em_texto_puro(client, db_session):
    from sqlalchemy import select

    tokens, _, _ = await signup_user(client)
    rows = (await db_session.execute(select(RefreshToken))).scalars().all()
    assert rows, "o signup deveria ter persistido um refresh token"
    for row in rows:
        assert row.token_hash != tokens["refresh_token"]
        # SHA-256 em hex: 64 caracteres, sem os pontos do JWT.
        assert len(row.token_hash) == 64
        assert "." not in row.token_hash
        assert isinstance(row.session_id, uuid.UUID)
