import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SalesGenie AI"
    VERSION: str = "2.1.0"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Configuration
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "salesgenie")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "salesgenie_password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "salesgenie_db")
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./salesgenie.db"
    
    # Redis / Celery Config (future proofing)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

settings = Settings()
