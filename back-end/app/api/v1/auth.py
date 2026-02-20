from fastapi import APIRouter

from app.core.security import create_access_token, create_refresh_token
from app.domain.auth.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    ResetPasswordRequest,
    SignupRequest,
    TokenPair,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

MOCK_USER_ID = "user-mock-001"


@router.post("/signup", response_model=TokenPair, status_code=201)
def signup(body: SignupRequest) -> TokenPair:
    """Cadastro de novo usuário."""
    return TokenPair(
        access_token=create_access_token(MOCK_USER_ID),
        refresh_token=create_refresh_token(MOCK_USER_ID),
    )


@router.post("/login", response_model=TokenPair)
def login(body: LoginRequest) -> TokenPair:
    """Login com email e senha."""
    return TokenPair(
        access_token=create_access_token(MOCK_USER_ID),
        refresh_token=create_refresh_token(MOCK_USER_ID),
    )


@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshRequest) -> TokenPair:
    """Renova o par de tokens usando refresh token."""
    return TokenPair(
        access_token=create_access_token(MOCK_USER_ID),
        refresh_token=create_refresh_token(MOCK_USER_ID),
    )


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(body: ForgotPasswordRequest) -> MessageResponse:
    """Envia email de recuperação de senha."""
    return MessageResponse(
        message="Se o email estiver cadastrado, você receberá as instruções em breve."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest) -> MessageResponse:
    """Redefine a senha usando token de recuperação."""
    return MessageResponse(message="Senha redefinida com sucesso.")


@router.post("/logout", response_model=MessageResponse)
def logout() -> MessageResponse:
    """Encerra a sessão do usuário."""
    return MessageResponse(message="Sessão encerrada com sucesso.")
