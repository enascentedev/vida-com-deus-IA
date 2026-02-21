"""Serviço de autenticação — signup, login, refresh, logout, recuperação de senha."""

import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.domain.auth.schemas import TokenPair
from app.repositories.user_repository import UserRepository

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def _hash_token(token: str) -> str:
    """Gera SHA-256 do token para armazenamento seguro no banco."""
    return hashlib.sha256(token.encode()).hexdigest()


async def _create_token_pair(
    repo: UserRepository, user_id: uuid.UUID
) -> TokenPair:
    """Gera par access/refresh e persiste o refresh token no banco."""
    access = create_access_token(str(user_id))
    refresh = create_refresh_token(str(user_id))

    expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.jwt_refresh_token_expire_days
    )
    await repo.save_refresh_token(
        user_id=user_id,
        token_hash=_hash_token(refresh),
        expires_at=expires_at,
    )
    return TokenPair(access_token=access, refresh_token=refresh)


async def signup(db: AsyncSession, name: str, email: str, password: str) -> TokenPair:
    """Cadastra novo usuário e retorna par de tokens."""
    repo = UserRepository(db)

    existing = await repo.get_by_email(email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado",
        )

    hashed_pw = pwd_context.hash(password)
    user = await repo.create(name=name, email=email, hashed_password=hashed_pw)
    return await _create_token_pair(repo, user.id)


async def login(db: AsyncSession, email: str, password: str) -> TokenPair:
    """Autentica usuário e retorna par de tokens."""
    repo = UserRepository(db)

    user = await repo.get_by_email(email)
    if not user or not pwd_context.verify(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Conta desativada",
        )

    return await _create_token_pair(repo, user.id)


async def refresh(db: AsyncSession, refresh_token_str: str) -> TokenPair:
    """Renova par de tokens usando refresh token válido."""
    repo = UserRepository(db)

    token_hash = _hash_token(refresh_token_str)
    stored = await repo.get_refresh_token(token_hash)

    if not stored or stored.is_revoked:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido",
        )

    if stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expirado",
        )

    # Revogar token atual e emitir novo par
    await repo.revoke_refresh_token(token_hash)
    return await _create_token_pair(repo, stored.user_id)


async def logout(db: AsyncSession, refresh_token_str: str) -> None:
    """Revoga o refresh token fornecido."""
    repo = UserRepository(db)
    token_hash = _hash_token(refresh_token_str)
    await repo.revoke_refresh_token(token_hash)


async def forgot_password(db: AsyncSession, email: str) -> None:
    """Cria token de recuperação de senha (sem enviar email por enquanto)."""
    repo = UserRepository(db)
    user = await repo.get_by_email(email)

    if not user:
        # Retorna silenciosamente para não revelar se o email existe
        return

    # Gerar token de reset e persistir hash no banco
    raw_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    await repo.save_password_reset_token(
        user_id=user.id,
        token_hash=_hash_token(raw_token),
        expires_at=expires_at,
    )
    # TODO: enviar email com raw_token quando serviço de email estiver disponível


async def reset_password(db: AsyncSession, token_str: str, new_password: str) -> None:
    """Redefine a senha usando token de recuperação válido."""
    repo = UserRepository(db)

    token_hash = _hash_token(token_str)
    stored = await repo.get_password_reset_token(token_hash)

    if not stored or stored.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de recuperação inválido",
        )

    if stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de recuperação expirado",
        )

    # Atualizar senha e marcar token como usado
    user = await repo.get_by_id(stored.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não encontrado",
        )

    await repo.update(user, hashed_password=pwd_context.hash(new_password))
    stored.used = True
    await db.flush()

    # Revogar todos os refresh tokens do usuário por segurança
    await repo.revoke_all_user_tokens(stored.user_id)
