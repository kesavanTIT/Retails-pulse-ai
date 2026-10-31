"""
core/config.py — Application settings loaded from .env
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    APP_NAME: str = "RetailPulse AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./data/retailpulse.db"

    # ML
    MODEL_DIR: str = "./data/models"

    # Boomi
    BOOMI_SECRET: str = "dev-boomi-secret-change-in-prod"

    # UKG Pro WFM
    UKG_BASE_URL: str = "https://your-tenant.ukg.com"
    UKG_CLIENT_ID: str = ""
    UKG_CLIENT_SECRET: str = ""
    UKG_TOKEN_URL: str = "https://your-tenant.ukg.com/oauth2/token"
    UKG_FORECAST_PATH: str = "/api/v1/forecasting/demand"
    UKG_SCHEDULE_PATH: str = "/api/v1/scheduling/shifts"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
