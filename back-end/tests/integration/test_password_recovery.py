"""Integração: recuperação de senha e revogação das sessões existentes."""

from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select, update

from app.models.user import PasswordResetToken
from tests.conftest import signup_user, unique_email

pytestmark = pytest.mark.db


async def _request_reset(client, email: str):
    return await client.post("/v1/auth/forgot-password", json={"email": email})


async def _reset_password(client, token: str, new_password: str = "nova-senha-segura-123"):
    return await client.post(
        "/v1/auth/reset-password",
        json={"token": token, "new_password": new_password},
    )


async def test_forgot_password_nao_revela_email_inexistente(client, db_session):
    response = await _request_reset(client, unique_email("fantasma"))

    assert response.status_code == 200
    tokens = (await db_session.execute(select(PasswordResetToken))).scalars().all()
    assert tokens == []


async def test_reset_valido_troca_senha_revoga_sessoes_e_impede_reuso(
    client, db_session, monkeypatch: pytest.MonkeyPatch
):
    raw_token = "token-de-recuperacao-conhecido"
    new_password = "nova-senha-segura-123"
    tokens, email, old_password = await signup_user(client)
    monkeypatch.setattr(
        "app.services.auth_service.secrets.token_urlsafe",
        lambda _: raw_token,
    )

    forgot = await _request_reset(client, email)
    assert forgot.status_code == 200

    stored = (await db_session.execute(select(PasswordResetToken))).scalar_one()
    assert stored.token_hash != raw_token
    assert len(stored.token_hash) == 64

    reset = await _reset_password(client, raw_token, new_password)
    assert reset.status_code == 200

    old_login = await client.post("/v1/auth/login", json={"email": email, "password": old_password})
    new_login = await client.post("/v1/auth/login", json={"email": email, "password": new_password})
    old_refresh = await client.post(
        "/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}
    )
    reused_reset = await _reset_password(client, raw_token, new_password)

    assert old_login.status_code == 401
    assert new_login.status_code == 200
    assert old_refresh.status_code == 401
    assert reused_reset.status_code == 400


async def test_reset_recusa_token_inexistente(client):
    response = await _reset_password(client, "token-que-nao-existe")
    assert response.status_code == 400


async def test_reset_recusa_token_expirado(client, db_session, monkeypatch: pytest.MonkeyPatch):
    raw_token = "token-de-recuperacao-expirado"
    _, email, _ = await signup_user(client)
    monkeypatch.setattr(
        "app.services.auth_service.secrets.token_urlsafe",
        lambda _: raw_token,
    )
    await _request_reset(client, email)
    await db_session.execute(
        update(PasswordResetToken).values(expires_at=datetime.now(UTC) - timedelta(minutes=1))
    )
    await db_session.commit()

    response = await _reset_password(client, raw_token)
    assert response.status_code == 400
