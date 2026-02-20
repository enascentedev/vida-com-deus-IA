from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token

bearer_scheme = HTTPBearer(auto_error=False)

# ID do usuário mockado para Fase 1
MOCK_USER_ID = "user-mock-001"


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """
    Fase 1: aceita qualquer token Bearer ou retorna mock user.
    Fase 2: substituir pela validação real do JWT.
    """
    if credentials is None:
        # Durante desenvolvimento/mocks, retorna usuário padrão
        return MOCK_USER_ID

    try:
        payload = decode_token(credentials.credentials)
        user_id: str = payload.get("sub", MOCK_USER_ID)
        return user_id
    except Exception:
        return MOCK_USER_ID


def require_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """Exige token válido — usar quando autenticação é obrigatória."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação necessário",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(credentials.credentials)
        return payload.get("sub", MOCK_USER_ID)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
