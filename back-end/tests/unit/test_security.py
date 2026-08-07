"""Testes unitários de emissão e validação de JWT — sem banco, sem rede."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from jose import jwt

from app.core.config import settings
from app.core.security import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_token,
)

USER_ID = str(uuid.uuid4())
SESSION_ID = str(uuid.uuid4())


def test_access_token_tem_claims_esperadas():
    token = create_access_token(USER_ID, SESSION_ID)
    payload = decode_token(token, expected_type="access")

    assert payload["sub"] == USER_ID
    assert payload["sid"] == SESSION_ID
    assert payload["type"] == "access"
    assert "exp" in payload
    assert "iat" in payload
    assert "jti" in payload


def test_refresh_token_tem_tipo_refresh_e_jti():
    token = create_refresh_token(USER_ID, SESSION_ID)
    payload = decode_token(token, expected_type="refresh")

    assert payload["type"] == "refresh"
    assert payload["jti"]


def test_refresh_usado_como_access_e_rejeitado():
    token = create_refresh_token(USER_ID, SESSION_ID)
    with pytest.raises(TokenError):
        decode_token(token, expected_type="access")


def test_access_usado_como_refresh_e_rejeitado():
    token = create_access_token(USER_ID, SESSION_ID)
    with pytest.raises(TokenError):
        decode_token(token, expected_type="refresh")


def test_token_sem_tipo_e_rejeitado():
    payload = {
        "sub": USER_ID,
        "exp": datetime.now(UTC) + timedelta(minutes=5),
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    with pytest.raises(TokenError):
        decode_token(token, expected_type="access")


def test_token_sem_sub_e_rejeitado():
    payload = {
        "type": "access",
        "exp": datetime.now(UTC) + timedelta(minutes=5),
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    with pytest.raises(TokenError):
        decode_token(token, expected_type="access")


def test_token_expirado_e_rejeitado():
    payload = {
        "sub": USER_ID,
        "type": "access",
        "exp": datetime.now(UTC) - timedelta(minutes=1),
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    with pytest.raises(TokenError):
        decode_token(token, expected_type="access")


def test_token_com_assinatura_invalida_e_rejeitado():
    token = jwt.encode(
        {
            "sub": USER_ID,
            "type": "access",
            "exp": datetime.now(UTC) + timedelta(minutes=5),
        },
        "outro-segredo-que-nao-e-o-da-aplicacao-123456",
        algorithm=settings.jwt_algorithm,
    )
    with pytest.raises(TokenError):
        decode_token(token, expected_type="access")


def test_token_com_algoritmo_diferente_e_rejeitado():
    # Assinado com HS384 enquanto a aplicação só aceita o algoritmo configurado.
    token = jwt.encode(
        {
            "sub": USER_ID,
            "type": "access",
            "exp": datetime.now(UTC) + timedelta(minutes=5),
        },
        settings.jwt_secret_key,
        algorithm="HS384",
    )
    if settings.jwt_algorithm == "HS384":
        pytest.skip("configuração local usa HS384; cenário não aplicável")
    with pytest.raises(TokenError):
        decode_token(token, expected_type="access")


def test_lixo_nao_e_token():
    with pytest.raises(TokenError):
        decode_token("nao-e-um-jwt", expected_type="access")
