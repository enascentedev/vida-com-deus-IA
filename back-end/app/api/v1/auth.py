from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.domain.auth.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
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
    """Renova o par de tokens usando refresh token."""
    return await auth_service.refresh(db, body.refresh_token)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    """Envia email de recuperação de senha."""
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
    body: RefreshRequest | None = None, db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    """Encerra a sessão do usuário."""
    if body and body.refresh_token:
        await auth_service.logout(db, body.refresh_token)
    return MessageResponse(message="Sessão encerrada com sucesso.")
