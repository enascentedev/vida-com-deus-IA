"""Configuração da aplicação lida do ambiente (`.env` ou variáveis reais).

`JWT_SECRET_KEY` e `DATABASE_URL` não têm valor padrão: a aplicação não sobe
sem eles. O segredo é validado quanto a tamanho e a valores de placeholder —
um `.env.example` copiado sem edição falha na inicialização, em vez de gerar
tokens assináveis por qualquer um.
"""

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

MIN_SECRET_LENGTH = 32

# Valores que aparecem em exemplos, tutoriais e no histórico deste repositório.
_PLACEHOLDER_SECRETS = frozenset(
    {
        "change-me-in-production-use-a-strong-random-secret",
        "change-me",
        "changeme",
        "secret",
        "supersecret",
        "your-secret-key",
        "string",
    }
)

_ALLOWED_ALGORITHMS = frozenset({"HS256", "HS384", "HS512"})


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "Vida com Deus API"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: str = "development"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # JWT
    jwt_secret_key: str = Field(min_length=MIN_SECRET_LENGTH)
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = Field(default=15, gt=0)
    jwt_refresh_token_expire_days: int = Field(default=7, gt=0)

    # Banco de dados
    database_url: str
    # Banco isolado usado pela suíte de testes. Ausente fora de CI/dev.
    test_database_url: str | None = None

    # Render — tamanho do banco contratado (em bytes)
    # Free: 1_073_741_824 (1 GB) | Starter: 10_737_418_240 (10 GB)
    # Standard: 37_580_963_840 (35 GB)
    render_db_size_bytes: int = 1_073_741_824

    # Redis (Fase 3)
    redis_url: str = "redis://localhost:6379/0"

    @field_validator("jwt_secret_key")
    @classmethod
    def _reject_placeholder_secret(cls, value: str) -> str:
        if value.strip().lower() in _PLACEHOLDER_SECRETS:
            raise ValueError(
                "JWT_SECRET_KEY está com um valor de exemplo. Gere um segredo com: "
                'python -c "import secrets; print(secrets.token_urlsafe(48))"'
            )
        return value

    @field_validator("jwt_algorithm")
    @classmethod
    def _restrict_algorithm(cls, value: str) -> str:
        if value not in _ALLOWED_ALGORITHMS:
            raise ValueError(
                f"JWT_ALGORITHM inválido: {value!r}. Permitidos: "
                f"{', '.join(sorted(_ALLOWED_ALGORITHMS))}."
            )
        return value

    @field_validator("database_url")
    @classmethod
    def _require_async_driver(cls, value: str) -> str:
        if not value.startswith("postgresql+psycopg://"):
            raise ValueError(
                "DATABASE_URL deve usar o driver async psycopg 3 "
                "(postgresql+psycopg://usuario:senha@host:porta/banco)."
            )
        return value

    @property
    def is_production(self) -> bool:
        return self.environment.strip().lower() in {"production", "prod"}


settings = Settings()  # type: ignore[call-arg]  # valores vêm do ambiente
