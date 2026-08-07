"""Falhas de autenticação que não dependem de PostgreSQL."""

import uuid
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.services import auth_service


def _install_repo(monkeypatch: pytest.MonkeyPatch, repo: AsyncMock) -> None:
    monkeypatch.setattr(auth_service, "UserRepository", lambda _db: repo)


async def test_signup_recusa_email_duplicado(monkeypatch: pytest.MonkeyPatch):
    repo = AsyncMock()
    repo.get_by_email.return_value = SimpleNamespace(id=uuid.uuid4())
    _install_repo(monkeypatch, repo)

    with pytest.raises(HTTPException) as exc_info:
        await auth_service.signup(AsyncMock(), "Nome", "duplicado@example.com", "senha-segura")

    assert exc_info.value.status_code == 409
    repo.create.assert_not_awaited()


async def test_login_recusa_usuario_inativo(monkeypatch: pytest.MonkeyPatch):
    repo = AsyncMock()
    repo.get_by_email.return_value = SimpleNamespace(
        id=uuid.uuid4(), hashed_password="hash", is_active=False
    )
    _install_repo(monkeypatch, repo)
    monkeypatch.setattr(auth_service.pwd_context, "verify", lambda *_: True)

    with pytest.raises(HTTPException) as exc_info:
        await auth_service.login(AsyncMock(), "inativo@example.com", "senha-segura")

    assert exc_info.value.status_code == 401


async def test_refresh_recusa_token_sem_registro(monkeypatch: pytest.MonkeyPatch):
    repo = AsyncMock()
    repo.get_refresh_token.return_value = None
    _install_repo(monkeypatch, repo)
    monkeypatch.setattr(
        auth_service,
        "decode_token",
        lambda *_args, **_kwargs: {"sub": str(uuid.uuid4())},
    )

    with pytest.raises(HTTPException) as exc_info:
        await auth_service.refresh(AsyncMock(), "refresh-sem-registro")

    assert exc_info.value.status_code == 401


async def test_refresh_revogado_derruba_sessao(monkeypatch: pytest.MonkeyPatch):
    session_id = uuid.uuid4()
    repo = AsyncMock()
    repo.get_refresh_token.return_value = SimpleNamespace(
        is_revoked=True,
        session_id=session_id,
    )
    _install_repo(monkeypatch, repo)
    monkeypatch.setattr(
        auth_service,
        "decode_token",
        lambda *_args, **_kwargs: {"sub": str(uuid.uuid4())},
    )

    with pytest.raises(HTTPException) as exc_info:
        await auth_service.refresh(AsyncMock(), "refresh-revogado")

    assert exc_info.value.status_code == 401
    repo.revoke_session.assert_awaited_once_with(session_id)


async def test_refresh_recusa_subject_divergente(monkeypatch: pytest.MonkeyPatch):
    user_id = uuid.uuid4()
    repo = AsyncMock()
    repo.get_refresh_token.return_value = SimpleNamespace(
        is_revoked=False,
        expires_at=datetime.now(UTC) + timedelta(hours=1),
        user_id=user_id,
    )
    _install_repo(monkeypatch, repo)
    monkeypatch.setattr(
        auth_service,
        "decode_token",
        lambda *_args, **_kwargs: {"sub": str(uuid.uuid4())},
    )

    with pytest.raises(HTTPException) as exc_info:
        await auth_service.refresh(AsyncMock(), "refresh-de-outro-usuario")

    assert exc_info.value.status_code == 401


async def test_logout_ignora_session_id_malformado(monkeypatch: pytest.MonkeyPatch):
    repo = AsyncMock()
    _install_repo(monkeypatch, repo)

    await auth_service.logout(AsyncMock(), session_id="nao-e-uuid")

    repo.revoke_session.assert_not_awaited()


async def test_forgot_password_nao_revela_usuario_ausente(
    monkeypatch: pytest.MonkeyPatch,
):
    repo = AsyncMock()
    repo.get_by_email.return_value = None
    _install_repo(monkeypatch, repo)

    await auth_service.forgot_password(AsyncMock(), "ausente@example.com")

    repo.save_password_reset_token.assert_not_awaited()


async def test_reset_recusa_token_sem_usuario(monkeypatch: pytest.MonkeyPatch):
    repo = AsyncMock()
    repo.get_password_reset_token.return_value = SimpleNamespace(
        used=False,
        expires_at=datetime.now(UTC) + timedelta(hours=1),
        user_id=uuid.uuid4(),
    )
    repo.get_by_id.return_value = None
    _install_repo(monkeypatch, repo)

    with pytest.raises(HTTPException) as exc_info:
        await auth_service.reset_password(AsyncMock(), "token-orfao", "nova-senha-segura")

    assert exc_info.value.status_code == 400
