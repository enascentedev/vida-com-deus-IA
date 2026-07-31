"""Contratos de request e response do domínio de autenticação.

O email é normalizado (sem espaços, minúsculo) antes de chegar ao serviço, para
que `Ana@Exemplo.com ` e `ana@exemplo.com` sejam o mesmo usuário. A senha tem
tamanho mínimo validado aqui — o serviço não recebe senha curta.
"""

from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, field_validator

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128

Password = Annotated[str, Field(min_length=MIN_PASSWORD_LENGTH, max_length=MAX_PASSWORD_LENGTH)]


class _NormalizedEmailMixin(BaseModel):
    """Normaliza o email antes da validação de formato."""

    # check_fields=False: o campo `email` é declarado nas subclasses.
    @field_validator("email", mode="before", check_fields=False)
    @classmethod
    def _normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value


class SignupRequest(_NormalizedEmailMixin):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: Password

    @field_validator("name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Nome não pode ser vazio")
        return stripped


class LoginRequest(_NormalizedEmailMixin):
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    """Body opcional do logout — quando ausente, a sessão do access token é revogada."""

    refresh_token: str | None = None


class ForgotPasswordRequest(_NormalizedEmailMixin):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: Password


class MessageResponse(BaseModel):
    message: str
