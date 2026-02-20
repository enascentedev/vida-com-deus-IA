from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    app_name: str = "Vida com Deus API"
    app_version: str = "0.1.0"
    debug: bool = False
    environment: str = "development"

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # JWT
    jwt_secret_key: str = "change-me-in-production-use-a-strong-random-secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 7

    # Database (Fase 2)
    database_url: str = "postgresql+psycopg://user:password@localhost:5432/vidacomdeus"

    # Redis (Fase 2)
    redis_url: str = "redis://localhost:6379/0"


settings = Settings()
