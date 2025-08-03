from typing import Dict, Any, Optional, List, Union
from pydantic import BaseModel, field_validator
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


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
    
    # Claude API
    CLAUDE_API_KEY: Optional[str] = None
    CLAUDE_MODEL: str = "claude-3-opus-20240229"
    CLAUDE_MAX_TOKENS: int = 1000
    CLAUDE_TEMPERATURE: float = 0.7
    
    # CORS
    ALLOWED_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
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
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra fields from .env file


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Create a global settings instance
settings = get_settings()


class APIInfo(BaseModel):
    """API Information for OpenAPI documentation"""

    title: str = "LionRocket AI Chat API"
    description: str = """
## 🚀 LionRocket AI Chat Service API

### Overview
LionRocket is an AI-powered chat service that leverages Anthropic's Claude API to provide intelligent conversational experiences. This API allows you to:

- 🤖 **Chat with AI Characters**: Engage with customizable AI personalities
- 🔐 **Secure Authentication**: JWT-based authentication system
- 👤 **User Management**: Complete user registration and profile management
- 📊 **Usage Tracking**: Monitor token usage and chat statistics
- 👨‍💼 **Admin Dashboard**: Comprehensive administrative controls

### Key Features
- **Real-time AI Responses**: Powered by Claude 3
- **Persistent Chat History**: All conversations are saved and can be resumed
- **Character Customization**: Create and manage different AI personalities
- **Rate Limiting**: Fair usage policies to ensure service quality
- **Comprehensive Logging**: Request tracking and monitoring

### Authentication
This API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register a new account or login with existing credentials
2. Include the JWT token in the Authorization header: `Bearer <token>`
3. Tokens expire after 24 hours

### Rate Limits
- General API: 100 requests per minute
- Chat Messages: 20 messages per minute

### Error Handling
All errors follow a consistent format:
```json
{
    "detail": "Error description",
    "status": 400
}
```

### Getting Started
1. Register at `/auth/register`
2. Login at `/auth/login` to get your JWT token
3. Create a chat session at `/api/chats`
4. Start chatting at `/api/chats/{id}/messages`

For more information, visit our [GitHub repository](https://github.com/your-repo/lionrocket).
    """
    version: str = "1.0.0"
    terms_of_service: str = "https://lionrocket.com/terms"
    contact: Dict[str, str] = {
        "name": "LionRocket Support",
        "email": "support@lionrocket.com",
        "url": "https://lionrocket.com/support",
    }
    license_info: Dict[str, str] = {
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    }


# OpenAPI Tags for grouping endpoints
TAGS_METADATA = [
    {
        "name": "authentication",
        "description": "User authentication and authorization operations",
        "externalDocs": {
            "description": "JWT Authentication Guide",
            "url": "https://jwt.io/introduction/",
        },
    },
    {
        "name": "chats",
        "description": "Chat session management and messaging",
    },
    {
        "name": "characters",
        "description": "AI character management and customization",
    },
    {
        "name": "prompts",
        "description": "Common prompt templates management",
    },
    {
        "name": "admin",
        "description": "Administrative operations (requires admin role)",
    },
    {
        "name": "health",
        "description": "Service health and status checks",
    },
]

# Security schemes for OpenAPI
SECURITY_SCHEMES = {
    "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        "description": "JWT token obtained from login endpoint",
    }
}

# API servers configuration
SERVERS = [
    {"url": "http://localhost:8000", "description": "Local development server"},
    {"url": "https://api.lionrocket.com", "description": "Production server"},
]

# Response examples
RESPONSE_EXAMPLES = {
    "401": {
        "description": "Unauthorized - Invalid or missing JWT token",
        "content": {
            "application/json": {
                "example": {"detail": "Could not validate credentials", "status": 401}
            }
        },
    },
    "403": {
        "description": "Forbidden - Insufficient permissions",
        "content": {
            "application/json": {"example": {"detail": "Not enough permissions", "status": 403}}
        },
    },
    "404": {
        "description": "Not Found - Resource does not exist",
        "content": {
            "application/json": {"example": {"detail": "Resource not found", "status": 404}}
        },
    },
    "422": {
        "description": "Validation Error - Invalid request data",
        "content": {
            "application/json": {
                "example": {
                    "detail": [
                        {
                            "loc": ["body", "field_name"],
                            "msg": "field required",
                            "type": "value_error.missing",
                        }
                    ],
                    "status": 422,
                }
            }
        },
    },
    "429": {
        "description": "Too Many Requests - Rate limit exceeded",
        "content": {
            "application/json": {
                "example": {"detail": "Rate limit exceeded: 20 per 1 minute", "status": 429}
            }
        },
    },
}

# Create API info instance
api_info = APIInfo()
