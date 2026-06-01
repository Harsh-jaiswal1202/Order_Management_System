from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/order_management"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    APP_NAME: str = "Order Management System"
    DEBUG: bool = False
    
    SECRET_KEY: str = "your-super-secret-jwt-key-replace-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
