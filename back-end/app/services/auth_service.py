"""Serviço de autenticação — signup, login, refresh, logout, recuperação de senha.

Regras que este módulo garante:

- senha só existe em memória; o banco guarda apenas o hash Argon2;
- refresh token nunca é armazenado em texto puro — só o SHA-256;
- cada login abre uma sessão; cada refresh rotaciona o token dentro dela;
- apresentar um refresh já revogado é tratado como reuso e derruba a sessão;
- credencial inválida devolve sempre a mesma resposta, com o mesmo custo de
  tempo, independentemente de o email existir ou não.
"""

import hashlib
import logging
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.domain.auth.schemas import TokenPair
from app.repositories.user_repository import UserRepository

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Credenciais inválidas",
)
_INVALID_REFRESH = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Refresh token inválido ou expirado",
)


def _hash_token(token: str) -> str:
    """SHA-256 do token, para armazenamento e busca.

    O token é um JWT com entropia própria (`jti` aleatório), então não há senha
    de baixa entropia a proteger — o hash existe para que um vazamento do banco
    não entregue tokens utilizáveis.
    """
    return hashlib.sha256(token.encode()).hexdigest()


async def _issue_token_pair(
    repo: UserRepository, user_id: uuid.UUID, session_id: uuid.UUID
) -> TokenPair:
    """Emite um par access/refresh e persiste o hash do refresh na sessão."""
    access = create_access_token(str(user_id), session_id)
    refresh = create_refresh_token(str(user_id), session_id)

    expires_at = datetime.now(UTC) + timedelta(days=settings.jwt_refresh_token_expire_days)
    await repo.save_refresh_token(
        user_id=user_id,
        session_id=session_id,
        token_hash=_hash_token(refresh),
        expires_at=expires_at,
    )
    return TokenPair(access_token=access, refresh_token=refresh)


async def signup(db: AsyncSession, name: str, email: str, password: str) -> TokenPair:
    """Cadastra novo usuário e abre a primeira sessão."""
    repo = UserRepository(db)

    if await repo.get_by_email(email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado",
        )

    user = await repo.create(name=name, email=email, hashed_password=pwd_context.hash(password))
    return await _issue_token_pair(repo, user.id, uuid.uuid4())


async def login(db: AsyncSession, email: str, password: str) -> TokenPair:
    """Autentica o usuário e abre uma nova sessão."""
    repo = UserRepository(db)
    user = await repo.get_by_email(email)

    if user is None:
        # Gasta o mesmo tempo de um hash real para que a ausência da conta não
        # seja detectável pela latência da resposta.
        pwd_context.dummy_verify()
        raise _INVALID_CREDENTIALS

    if not pwd_context.verify(password, user.hashed_password):
        raise _INVALID_CREDENTIALS

    if not user.is_active:
        # Mesma resposta de credencial inválida: não revela que a conta existe.
        raise _INVALID_CREDENTIALS

    return await _issue_token_pair(repo, user.id, uuid.uuid4())


async def refresh(db: AsyncSession, refresh_token_str: str) -> TokenPair:
    """Rotaciona o par de tokens, revogando o refresh apresentado."""
    repo = UserRepository(db)

    try:
        payload = decode_token(refresh_token_str, expected_type="refresh")
    except TokenError as exc:
        raise _INVALID_REFRESH from exc

    stored = await repo.get_refresh_token(_hash_token(refresh_token_str))
    if stored is None:
        raise _INVALID_REFRESH

    if stored.is_revoked:
        # Um token revogado sendo reapresentado significa que alguém guardou uma
        # cópia. Não dá para saber se é o dono ou um atacante, então a sessão
        # inteira cai e ambos precisam autenticar de novo.
        logger.warning("Reuso de refresh token detectado; sessão %s revogada", stored.session_id)
        await repo.revoke_session(stored.session_id)
        raise _INVALID_REFRESH

    if stored.expires_at < datetime.now(UTC):
        raise _INVALID_REFRESH

    if str(stored.user_id) != str(payload["sub"]):
        raise _INVALID_REFRESH

    user = await repo.get_by_id(stored.user_id)
    if user is None or not user.is_active:
        await repo.revoke_all_user_tokens(stored.user_id)
        raise _INVALID_REFRESH

    await repo.revoke_refresh_token(stored.token_hash)
    return await _issue_token_pair(repo, stored.user_id, stored.session_id)


async def logout(
    db: AsyncSession,
    refresh_token_str: str | None = None,
    session_id: str | None = None,
) -> None:
    """Revoga a sessão indicada pelo refresh token ou pelo access token.

    Idempotente: revogar uma sessão já revogada (ou inexistente) não é erro —
    o cliente não deve ficar preso a um token que quer descartar.
    """
    repo = UserRepository(db)

    if refresh_token_str:
        stored = await repo.get_refresh_token(_hash_token(refresh_token_str))
        if stored is not None:
            await repo.revoke_session(stored.session_id)
            return

    if session_id:
        try:
            session_uuid = uuid.UUID(session_id)
        except ValueError:
            logger.warning("Logout com session_id malformado ignorado")
            return
        await repo.revoke_session(session_uuid)


async def logout_all(db: AsyncSession, user_id: str) -> None:
    """Revoga todas as sessões ativas do usuário."""
    await UserRepository(db).revoke_all_user_tokens(uuid.UUID(user_id))


async def forgot_password(db: AsyncSession, email: str) -> None:
    """Cria token de recuperação de senha.

    O envio por email ainda não existe (ver README — recuperação de senha é
    parcial): o token é persistido, mas não chega ao usuário por nenhum canal.
    """
    repo = UserRepository(db)
    user = await repo.get_by_email(email)

    if user is None:
        # Retorna em silêncio para não revelar se o email está cadastrado.
        return

    raw_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(UTC) + timedelta(hours=1)
    await repo.save_password_reset_token(
        user_id=user.id,
        token_hash=_hash_token(raw_token),
        expires_at=expires_at,
    )
    logger.warning(
        "Token de recuperação criado para o usuário %s, mas não enviado: "
        "serviço de email não implementado",
        user.id,
    )


async def reset_password(db: AsyncSession, token_str: str, new_password: str) -> None:
    """Redefine a senha e derruba todas as sessões do usuário."""
    repo = UserRepository(db)

    stored = await repo.get_password_reset_token(_hash_token(token_str))
    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Token de recuperação inválido ou expirado",
    )

    if stored is None or stored.used:
        raise invalid

    if stored.expires_at < datetime.now(UTC):
        raise invalid

    user = await repo.get_by_id(stored.user_id)
    if user is None:
        raise invalid

    await repo.update(user, hashed_password=pwd_context.hash(new_password))
    stored.used = True
    await db.flush()

    await repo.revoke_all_user_tokens(stored.user_id)
