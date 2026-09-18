from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parent
REPO_ROOT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):

    SUPABASE_URL: str | None = None
    SUPABASE_KEY: str | None = None

    GEMINI_API_KEY: str | None = None
    WEATHER_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=[
            BACKEND_DIR / ".env",
            REPO_ROOT_DIR / ".env",
        ],
        env_file_encoding="utf-8"
    )


settings = Settings()