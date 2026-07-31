"""Testes da validação de configuração — segredos fracos não podem subir."""

import pytest
from pydantic import ValidationError

from app.core.config import Settings

VALID = {
    "jwt_secret_key": "x" * 48,
    "database_url": "postgresql+psycopg://u:p@localhost:5432/db",
}


def _settings(**overrides: object) -> Settings:
    # _env_file=None isola o teste do .env local do desenvolvedor.
    return Settings(_env_file=None, **{**VALID, **overrides})  # type: ignore[call-arg]


def test_configuracao_valida_e_aceita():
    settings = _settings()
    assert settings.jwt_algorithm == "HS256"
    assert not settings.is_production


def test_segredo_curto_e_rejeitado():
    with pytest.raises(ValidationError):
        _settings(jwt_secret_key="curto")


@pytest.mark.parametrize(
    "placeholder",
    [
        "change-me-in-production-use-a-strong-random-secret",
        "CHANGE-ME-IN-PRODUCTION-USE-A-STRONG-RANDOM-SECRET",
    ],
)
def test_segredo_placeholder_e_rejeitado(placeholder: str):
    with pytest.raises(ValidationError):
        _settings(jwt_secret_key=placeholder)


def test_segredo_ausente_e_rejeitado():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, database_url=VALID["database_url"])  # type: ignore[call-arg]


def test_database_url_ausente_e_rejeitada():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, jwt_secret_key=VALID["jwt_secret_key"])  # type: ignore[call-arg]


def test_database_url_sem_driver_async_e_rejeitada():
    with pytest.raises(ValidationError):
        _settings(database_url="postgresql://u:p@localhost:5432/db")


def test_algoritmo_assimetrico_nao_configuravel():
    # A validação usa segredo simétrico; permitir "none" ou RS256 via env abriria
    # espaço para downgrade de algoritmo.
    with pytest.raises(ValidationError):
        _settings(jwt_algorithm="none")
    with pytest.raises(ValidationError):
        _settings(jwt_algorithm="RS256")


def test_expiracao_precisa_ser_positiva():
    with pytest.raises(ValidationError):
        _settings(jwt_access_token_expire_minutes=0)
    with pytest.raises(ValidationError):
        _settings(jwt_refresh_token_expire_days=-1)


def test_is_production():
    assert _settings(environment="production").is_production
    assert _settings(environment="PROD").is_production
    assert not _settings(environment="development").is_production
