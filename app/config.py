"""Configuration settings for the Aivora backend using Pydantic Settings."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """System settings loaded from environment variables or .env file."""

    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@127.0.0.1:54322/postgres",
        description="SQLAlchemy database connection URL",
    )
    jwt_secret_key: str = Field(
        default="super-secret-aivora-jwt-key-change-in-production-2026",
        description="Secret key for JWT signing",
    )
    jwt_algorithm: str = Field(default="HS256", description="Algorithm used for JWT signing")
    access_token_expire_minutes: int = Field(default=1440, description="Token expiration time in minutes")
    gemini_api_key: str = Field(
        default="mock-gemini-api-key-for-local-dev",
        description="Google Gemini API key for ADK agents",
    )
    port: int = Field(default=8000, description="Port number for FastAPI server")
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"],
        description="Allowed CORS origins",
    )

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def DATABASE_URL(self) -> str:
        return self.database_url

    @property
    def SECRET_KEY(self) -> str:
        return self.jwt_secret_key

    @property
    def ALGORITHM(self) -> str:
        return self.jwt_algorithm

    @property
    def ACCESS_TOKEN_EXPIRE_MINUTES(self) -> int:
        return self.access_token_expire_minutes


@lru_cache
def get_settings() -> Settings:
    """Return a cached instance of the system settings."""
    return Settings()


settings = get_settings()
