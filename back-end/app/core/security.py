"""Emissão e validação de JSON Web Tokens.

Todo token carrega um claim `type` explícito (`access` ou `refresh`) e um `sid`
que identifica a sessão à qual pertence. A validação exige o tipo esperado —
um refresh token nunca é aceito em rota protegida, e um token sem `type` é
rejeitado.
"""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

from jose import JWTError, jwt

from app.core.config import settings

TokenType = Literal["access", "refresh"]


class TokenError(Exception):
    """Token ausente, malformado, expirado, com assinatura ou tipo inválido."""


def _encode(payload: dict[str, Any]) -> str:
    # python-jose não distribui stubs de tipo; o retorno é sempre str.
    token: str = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token


def create_access_token(subject: str | Any, session_id: str | uuid.UUID) -> str:
    """Gera um access token de vida curta vinculado a uma sessão."""
    now = datetime.now(UTC)
    expire = now + timedelta(minutes=settings.jwt_access_token_expire_minutes)
    return _encode(
        {
            "sub": str(subject),
            "sid": str(session_id),
            "type": "access",
            "iat": now,
            "exp": expire,
            "jti": uuid.uuid4().hex,
        }
    )


def create_refresh_token(subject: str | Any, session_id: str | uuid.UUID) -> str:
    """Gera um refresh token de vida longa vinculado a uma sessão."""
    now = datetime.now(UTC)
    expire = now + timedelta(days=settings.jwt_refresh_token_expire_days)
    return _encode(
        {
            "sub": str(subject),
            "sid": str(session_id),
            "type": "refresh",
            "iat": now,
            "exp": expire,
            "jti": uuid.uuid4().hex,
        }
    )


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    """Decodifica e valida um token, exigindo o tipo informado.

    Levanta `TokenError` quando a assinatura, o algoritmo, a expiração, o
    claim `sub` ou o claim `type` não conferem.
    """
    try:
        payload: dict[str, Any] = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError as exc:
        raise TokenError("Token inválido ou expirado") from exc

    token_type = payload.get("type")
    if token_type is None:
        raise TokenError("Token sem tipo declarado")
    if token_type != expected_type:
        raise TokenError(f"Esperado token do tipo '{expected_type}', recebido '{token_type}'")

    if not payload.get("sub"):
        raise TokenError("Token sem 'sub'")

    return payload
