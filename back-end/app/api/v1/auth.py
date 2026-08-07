from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user_id, get_optional_session_id
from app.domain.auth.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    LogoutRequest,
    MessageResponse,
    RefreshRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenPair,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenPair, status_code=201)
async def signup(body: SignupRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    """Cadastro de novo usuário."""
    return await auth_service.signup(db, body.name, body.email, body.password)


@router.post("/login", response_model=TokenPair)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    """Login com email e senha."""
    return await auth_service.login(db, body.email, body.password)


@router.post("/refresh", response_model=TokenPair)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)) -> TokenPair:
    """Renova o par de tokens, rotacionando o refresh token."""
    return await auth_service.refresh(db, body.refresh_token)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    """Inicia a recuperação de senha.

    A resposta é a mesma exista ou não a conta, para não revelar quais emails
    estão cadastrados.
    """
    await auth_service.forgot_password(db, body.email)
    return MessageResponse(
        message="Se o email estiver cadastrado, você receberá as instruções em breve."
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(
    body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    """Redefine a senha usando token de recuperação."""
    await auth_service.reset_password(db, body.token, body.new_password)
    return MessageResponse(message="Senha redefinida com sucesso.")


@router.post("/logout", response_model=MessageResponse)
async def logout(
    body: LogoutRequest | None = None,
    session_id: str | None = Depends(get_optional_session_id),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Revoga a sessão atual.

    Aceita o refresh token no corpo ou, na ausência dele, usa a sessão do access
    token enviado no header. É idempotente — repetir o logout devolve 200.
    """
    await auth_service.logout(
        db,
        refresh_token_str=body.refresh_token if body else None,
        session_id=session_id,
    )
    return MessageResponse(message="Sessão encerrada com sucesso.")


@router.post("/logout-all", response_model=MessageResponse)
async def logout_all(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    """Revoga todas as sessões ativas do usuário autenticado."""
    await auth_service.logout_all(db, user_id)
    return MessageResponse(message="Todas as sessões foram encerradas.")
