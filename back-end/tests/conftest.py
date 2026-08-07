"""Fixtures compartilhadas da suíte.

Testes marcados com `@pytest.mark.db` exigem um PostgreSQL isolado, apontado
por `TEST_DATABASE_URL`. Sem essa variável eles são pulados com o motivo
explícito — e, quando `REQUIRE_DB=1` (caso do CI), o pulo vira falha: a suíte
nunca "passa" silenciosamente sem ter tocado o banco.

O banco de teste recebe as migrations Alembic uma vez por sessão e tem as
tabelas truncadas entre um teste e outro. Nunca aponte `TEST_DATABASE_URL`
para o banco de desenvolvimento.
"""

import asyncio
import os
import shutil
import sys
import uuid
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import get_db
from app.main import app

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")
REQUIRE_DB = os.environ.get("REQUIRE_DB") == "1"

_REAL_DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Tabelas de dados da aplicação — a ordem não importa por causa do CASCADE.
_APP_TABLES = (
    "chat_citations",
    "chat_messages",
    "chat_conversations",
    "reading_history",
    "favorites",
    "post_tags",
    "posts",
    "storage_snapshots",
    "password_reset_tokens",
    "refresh_tokens",
    "user_settings",
    "users",
)

if sys.platform == "win32":
    # psycopg async exige SelectorEventLoop no Windows.
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


def pytest_collection_modifyitems(config: pytest.Config, items: list[pytest.Item]) -> None:
    """Aplica a política de banco aos testes marcados com `db`.

    Com `REQUIRE_DB=1` e sem banco, a coleta é interrompida com erro: um pipeline
    que não conseguiu subir o PostgreSQL precisa ficar vermelho, não verde com
    trinta testes pulados.
    """
    if TEST_DATABASE_URL:
        return
    if REQUIRE_DB:
        raise pytest.UsageError(
            "REQUIRE_DB=1 exige TEST_DATABASE_URL apontando para um PostgreSQL de "
            "teste. Os testes de banco não podem ser pulados nesta configuração."
        )
    skip = pytest.mark.skip(
        reason="TEST_DATABASE_URL não definido — teste de banco pulado (defina a "
        "variável para executar; no CI o REQUIRE_DB=1 torna isso obrigatório)"
    )
    for item in items:
        if "db" in item.keywords:
            item.add_marker(skip)


@pytest.fixture(autouse=True)
def _isolate_json_storage(
    tmp_path_factory: pytest.TempPathFactory, monkeypatch: pytest.MonkeyPatch
) -> Path:
    """Redireciona o storage JSON para um diretório temporário.

    O domínio therapist e o histórico de ETL ainda gravam em `data/*.json`. Sem
    este redirecionamento, rodar a suíte altera arquivos versionados do
    repositório — os testes passariam, mas deixariam um diff espúrio para trás.
    """
    tmp_data = tmp_path_factory.mktemp("data")
    for original in _REAL_DATA_DIR.glob("*.json"):
        shutil.copy(original, tmp_data / original.name)
    monkeypatch.setattr("app.core.storage.DATA_DIR", tmp_data)
    return tmp_data


@pytest.fixture(scope="session")
def _migrated_database() -> str:
    """Aplica as migrations no banco de teste uma vez por sessão."""
    assert TEST_DATABASE_URL is not None  # garantido pelo skip em modifyitems

    from alembic import command
    from alembic.config import Config as AlembicConfig

    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    alembic_cfg = AlembicConfig(os.path.join(backend_dir, "alembic.ini"))
    alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "migrations"))
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)

    # O env.py lê a URL de settings; o override por variável de ambiente garante
    # que a migration rode no banco de TESTE, nunca no de desenvolvimento.
    original = os.environ.get("DATABASE_URL")
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    try:
        command.upgrade(alembic_cfg, "head")
    finally:
        if original is not None:
            os.environ["DATABASE_URL"] = original

    return TEST_DATABASE_URL


@pytest.fixture
async def db_session(_migrated_database: str) -> AsyncGenerator[AsyncSession, None]:
    """Sessão sobre o banco de teste, com tabelas limpas ao final do teste."""
    engine = create_async_engine(_migrated_database, poolclass=None)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        yield session
        await session.rollback()

    async with engine.begin() as conn:
        await conn.execute(text(f"TRUNCATE {', '.join(_APP_TABLES)} RESTART IDENTITY CASCADE"))
    await engine.dispose()


@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Cliente HTTP da aplicação com o banco de teste injetado."""

    async def _get_test_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session
        await db_session.commit()

    app.dependency_overrides[get_db] = _get_test_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http:
        yield http
    app.dependency_overrides.pop(get_db, None)


# ── Fábricas ──────────────────────────────────────────────────────────────────


def unique_email(prefix: str = "user") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}@teste.com"


async def signup_user(
    client: AsyncClient,
    *,
    name: str = "Usuária de Teste",
    email: str | None = None,
    password: str = "senha-segura-123",
) -> tuple[dict, str, str]:
    """Cadastra um usuário e devolve (tokens, email, senha)."""
    email = email or unique_email()
    response = await client.post(
        "/v1/auth/signup",
        json={"name": name, "email": email, "password": password},
    )
    assert response.status_code == 201, response.text
    return response.json(), email, password


def auth_headers(tokens: dict) -> dict[str, str]:
    return {"Authorization": f"Bearer {tokens['access_token']}"}
