"""Integração: cadastro e login contra PostgreSQL real."""

import pytest

from tests.conftest import auth_headers, signup_user, unique_email

pytestmark = pytest.mark.db


async def test_signup_cria_usuario_e_devolve_tokens(client):
    tokens, _, _ = await signup_user(client)
    assert tokens["access_token"]
    assert tokens["refresh_token"]
    assert tokens["token_type"] == "bearer"


async def test_signup_email_duplicado_da_409(client):
    _, email, senha = await signup_user(client)
    r = await client.post(
        "/v1/auth/signup",
        json={"name": "Outra Pessoa", "email": email, "password": senha},
    )
    assert r.status_code == 409


async def test_signup_normaliza_email_no_banco(client):
    email = unique_email()
    await signup_user(client, email=f"  {email.upper()}  ")
    # O mesmo email em minúsculo é duplicata — prova que foi normalizado.
    r = await client.post(
        "/v1/auth/signup",
        json={"name": "Duplicada", "email": email, "password": "senha-segura-123"},
    )
    assert r.status_code == 409


async def test_signup_senha_curta_da_422(client):
    r = await client.post(
        "/v1/auth/signup",
        json={"name": "Ana", "email": unique_email(), "password": "1234567"},
    )
    assert r.status_code == 422


async def test_login_com_credenciais_validas(client):
    _, email, senha = await signup_user(client)
    r = await client.post("/v1/auth/login", json={"email": email, "password": senha})
    assert r.status_code == 200
    assert r.json()["access_token"]


async def test_login_senha_errada_da_401_generico(client):
    _, email, _ = await signup_user(client)
    r = await client.post("/v1/auth/login", json={"email": email, "password": "senha-errada-1"})
    assert r.status_code == 401
    assert r.json()["detail"] == "Credenciais inválidas"


async def test_login_usuario_inexistente_da_mesma_resposta(client):
    r = await client.post(
        "/v1/auth/login",
        json={"email": unique_email("fantasma"), "password": "qualquer-senha-1"},
    )
    assert r.status_code == 401
    # Mesma mensagem do caso "senha errada": não revela se a conta existe.
    assert r.json()["detail"] == "Credenciais inválidas"


async def test_perfil_nao_expoe_hash(client):
    tokens, email, _ = await signup_user(client)
    r = await client.get("/v1/users/me", headers=auth_headers(tokens))
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == email
    assert "hashed_password" not in body
    assert "password" not in body
