from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, field_validator, ConfigDict
from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from pathlib import Path
from dotenv import load_dotenv

# Get the backend directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"

# Load .env file explicitly
if ENV_FILE.exists():
    load_dotenv(ENV_FILE)
    print(f"Loaded .env from: {ENV_FILE}")
else:
    print(f"Warning: .env file not found at {ENV_FILE}")


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "LionRocket"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/lionrocket.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    JWT_SECRET: str = "your-jwt-secret-key-here-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    
    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    def parse_cors(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    CHAT_RATE_LIMIT_PER_MINUTE: int = 20
    
    # Admin
    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_EMAIL: str = "admin@lionrocket.com"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: Optional[str] = "./logs/app.log"
    
    model_config = ConfigDict(
        env_file=str(ENV_FILE),
        case_sensitive=True,
        extra="ignore"  # Ignore extra fields from .env file
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Create a global settings instance
settings = get_settings()


# Note: OpenAPI configuration has been removed to use FastAPI's default Swagger implementation