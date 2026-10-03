import os
from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    # Database
    POSTGRES_USER: str = "miraaj"
    POSTGRES_PASSWORD: str = "miraaj"
    POSTGRES_DB: str = "miraaj"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    STORAGE_PROVIDER: str = "local"
    STORAGE_LOCAL_ROOT: str = str(PROJECT_ROOT / "storage" / "projects")

    # Media / FFmpeg
    FFMPEG_PATH: Optional[str] = None
    FFPROBE_PATH: Optional[str] = None

    # AI Provider
    AI_PROVIDER: str = "mock"
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    # Video Defaults
    DEFAULT_WIDTH: int = 1080
    DEFAULT_HEIGHT: int = 1920
    DEFAULT_FPS: int = 30
    DEFAULT_STYLE: str = "modern_creator_v1"

    @property
    def effective_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    class Config:
        env_file = str(PROJECT_ROOT / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
