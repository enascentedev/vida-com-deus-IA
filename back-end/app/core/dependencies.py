import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import TokenError, decode_token
from app.repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token inválido ou expirado",
    headers={"WWW-Authenticate": "Bearer"},
)


class AuthenticatedUser:
    """Identidade resolvida a partir de um access token válido."""

    __slots__ = ("id", "session_id")

    def __init__(self, user_id: uuid.UUID, session_id: str | None) -> None:
        self.id = user_id
        self.session_id = session_id


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> AuthenticatedUser:
    """Valida o access token e confirma que o usuário existe e está ativo.

    Apenas falhas de autenticação viram 401. Erros de banco propagam — não
    são convertidos em "token inválido".
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token necessário",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(credentials.credentials, expected_type="access")
        user_id = uuid.UUID(str(payload["sub"]))
    except (TokenError, ValueError) as exc:
        raise _UNAUTHORIZED from exc

    user = await UserRepository(db).get_by_id(user_id)
    if user is None or not user.is_active:
        raise _UNAUTHORIZED

    session_id = payload.get("sid")
    return AuthenticatedUser(user.id, str(session_id) if session_id else None)


async def get_current_user_id(
    user: AuthenticatedUser = Depends(get_current_user),
) -> str:
    """Identificador do usuário autenticado — usado pelos routers de domínio."""
    return str(user.id)


async def get_optional_session_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str | None:
    """Sessão do access token, quando houver um token válido no header.

    Usada pelo logout, que precisa funcionar mesmo sem token utilizável — nesse
    caso o cliente envia o refresh token no corpo.
    """
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials, expected_type="access")
    except TokenError:
        return None
    session_id = payload.get("sid")
    return str(session_id) if session_id else None


# Alias mantido por compatibilidade: ambos exigem autenticação real.
require_current_user_id = get_current_user_id
