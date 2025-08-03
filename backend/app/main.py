from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn
import logging

from app.auth.router import auth_router
from app.api.endpoints import chat, character
from app.routers import prompt, admin
from app.database import create_tables
from app.middleware import (
    # Rate limiting
    limiter,
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
    # Other middleware
    RequestIDMiddleware,
    TimingMiddleware,
    LoggingMiddleware,
    SecurityHeadersMiddleware,
    RequestSizeLimitMiddleware,
    APISecurityMiddleware,
)
from app.core.config import api_info, TAGS_METADATA, SERVERS

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=api_info.title,
    description=api_info.description,
    version=api_info.version,
    terms_of_service=api_info.terms_of_service,
    contact=api_info.contact,
    license_info=api_info.license_info,
    openapi_tags=TAGS_METADATA,
    servers=SERVERS,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add middleware in proper order (order matters!)
# 1. Request ID - Should be first to assign IDs
app.add_middleware(RequestIDMiddleware)

# 2. Request size limit - Should be early to reject large requests
app.add_middleware(RequestSizeLimitMiddleware, max_size=5 * 1024 * 1024)  # 5MB limit

# 3. Security headers - Add security headers to all responses
app.add_middleware(SecurityHeadersMiddleware)

# 4. API Security - Custom API headers
app.add_middleware(APISecurityMiddleware, api_version="1.0.0")

# 5. CORS - Must be before authentication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vue/React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. Timing - Measure response times
app.add_middleware(TimingMiddleware)

# 7. Logging - Log all requests (should be after ID assignment)
app.add_middleware(LoggingMiddleware)


# 데이터베이스 테이블 생성 및 초기 데이터 설정
@app.on_event("startup")
async def startup_event():
    from sqlalchemy.orm import Session
    from app.database import SessionLocal
    from app.models import User, Character
    from app.auth.router import get_password_hash
    import os

    logger.info("Starting up LionRocket AI Chat Service...")

    # Create tables
    create_tables()
    logger.info("Database tables created/verified")

    # Create default admin user if not exists
    db: Session = SessionLocal()
    try:
        # Check if any admin exists
        admin_exists = db.query(User).filter(User.is_admin == True).first()

        if not admin_exists:
            # Get admin credentials from environment
            admin_username = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
            admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@lionrocket.com")
            admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")

            # Create default admin
            default_admin = User(
                username=admin_username,
                email=admin_email,
                password_hash=get_password_hash(admin_password),
                is_admin=True,
            )
            db.add(default_admin)
            db.commit()
            logger.info(f"Default admin user created: {admin_username}")

        # Create default characters if none exist
        character_count = db.query(Character).count()
        if character_count == 0:
            # Get first admin user
            admin = db.query(User).filter(User.is_admin == True).first()

            default_characters = [
                {
                    "name": "Claude Assistant",
                    "system_prompt": "You are Claude, a helpful AI assistant created by Anthropic. You aim to be helpful, harmless, and honest in all your interactions.",
                },
                {
                    "name": "Creative Writer",
                    "system_prompt": "You are a creative writing assistant. Help users with storytelling, creative writing, and imaginative scenarios. Be descriptive and engaging.",
                },
                {
                    "name": "Code Helper",
                    "system_prompt": "You are a programming assistant. Help users with coding questions, debugging, and software development. Provide clear explanations and practical examples.",
                },
            ]

            for char_data in default_characters:
                character = Character(
                    name=char_data["name"],
                    system_prompt=char_data["system_prompt"],
                    created_by=admin.id,
                )
                db.add(character)

            db.commit()
            logger.info(f"Created {len(default_characters)} default characters")

    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        db.rollback()
    finally:
        db.close()

    logger.info("Startup complete!")


# 라우터 등록
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(chat.router, prefix="/api/chats", tags=["chats"])
app.include_router(character.router, prefix="/api/characters", tags=["characters"])
app.include_router(prompt.router, prefix="/api/prompts", tags=["prompts"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])


# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code, content={"detail": exc.detail, "status": exc.status_code}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(status_code=422, content={"detail": exc.errors(), "status": 422})


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "status": 500})


@app.get(
    "/",
    tags=["health"],
    summary="API Root",
    description="Get API information and available endpoints",
)
async def root():
    """
    Root endpoint providing API information and navigation links.

    Returns:
        dict: API information including version and documentation URLs
    """
    return {
        "message": "LionRocket AI Chat API",
        "version": api_info.version,
        "docs": "/docs",
        "redoc": "/redoc",
        "openapi": "/openapi.json",
    }


@app.get(
    "/health",
    tags=["health"],
    summary="Health Check",
    description="Check if the service is healthy",
)
async def health_check():
    """
    Health check endpoint for monitoring service status.

    Returns:
        dict: Service health status
    """
    return {"status": "healthy", "service": "LionRocket AI Chat"}


# SSE endpoint is now handled in chat router


# Custom OpenAPI schema
def custom_openapi():
    from app.core.docs import custom_openapi as generate_openapi

    return generate_openapi(app)


app.openapi = custom_openapi

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
