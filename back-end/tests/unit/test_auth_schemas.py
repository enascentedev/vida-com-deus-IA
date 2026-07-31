"""Testes de validação dos schemas de autenticação — sem banco, sem rede."""

import pytest
from pydantic import ValidationError

from app.domain.auth.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    ResetPasswordRequest,
    SignupRequest,
)

VALID_SIGNUP = {
    "name": "Maria Souza",
    "email": "maria@exemplo.com",
    "password": "senha-segura-123",
}


def test_signup_valido():
    req = SignupRequest(**VALID_SIGNUP)
    assert req.email == "maria@exemplo.com"


@pytest.mark.parametrize(
    ("raw", "normalized"),
    [
        ("  MARIA@Exemplo.COM  ", "maria@exemplo.com"),
        ("Maria@exemplo.com", "maria@exemplo.com"),
    ],
)
def test_email_e_normalizado(raw: str, normalized: str):
    assert SignupRequest(**{**VALID_SIGNUP, "email": raw}).email == normalized
    assert LoginRequest(email=raw, password="qualquer").email == normalized
    assert ForgotPasswordRequest(email=raw).email == normalized


@pytest.mark.parametrize("password", ["", "1234567", "curta"])
def test_senha_curta_e_rejeitada(password: str):
    with pytest.raises(ValidationError):
        SignupRequest(**{**VALID_SIGNUP, "password": password})
    with pytest.raises(ValidationError):
        ResetPasswordRequest(token="tok", new_password=password)


def test_senha_gigante_e_rejeitada():
    with pytest.raises(ValidationError):
        SignupRequest(**{**VALID_SIGNUP, "password": "x" * 129})


@pytest.mark.parametrize("email", ["nao-e-email", "a@", "@b.com", ""])
def test_email_invalido_e_rejeitado(email: str):
    with pytest.raises(ValidationError):
        SignupRequest(**{**VALID_SIGNUP, "email": email})


def test_nome_vazio_e_rejeitado():
    with pytest.raises(ValidationError):
        SignupRequest(**{**VALID_SIGNUP, "name": "   "})


def test_payload_incompleto_e_rejeitado():
    with pytest.raises(ValidationError):
        SignupRequest(name="Só Nome")  # type: ignore[call-arg]
