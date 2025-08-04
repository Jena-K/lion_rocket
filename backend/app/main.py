from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import uvicorn
import logging
from pathlib import Path

from app.routers import auth, chat, character, admin
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
    # Admin middleware
    add_admin_middleware,
)

from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="LionRocket AI Chat API",
    description="AI-powered chat service using Anthropic's Claude API",
    version="1.0.0",
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
    allow_origins=[
        "http://localhost:3000",      # React dev server
        "http://localhost:5173",      # Vite dev server (default)
        "http://localhost:5174",      # Vite dev server (alternate)
        "http://localhost:5175",      # Vite dev server (alternate)
        "http://localhost:5176",      # Vite dev server (alternate)
        "http://localhost:5177",      # Vite dev server (alternate)
        "http://localhost:5178",      # Vite dev server (current)
        "http://localhost:5179",      # Vite dev server (current)
        "http://localhost:5180",      # Vite dev server (current)
        "http://localhost:8000",      # FastAPI docs
        "http://localhost:8080",      # Additional Vue dev server port
        "http://127.0.0.1:5173",      # Vite with 127.0.0.1
        "http://127.0.0.1:5174",      # Vite alternate with 127.0.0.1
        "http://127.0.0.1:5178",      # Vite current with 127.0.0.1
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 6. Timing - Measure response times
app.add_middleware(TimingMiddleware)

# 7. Logging - Log all requests (should be after ID assignment)
app.add_middleware(LoggingMiddleware)

# 8. Admin-specific middleware - Enhanced security and logging for admin endpoints
add_admin_middleware(app)


# Application startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database tables on application startup"""
    logger.info("Creating database tables...")
    await create_tables()
    logger.info("Database tables created successfully")


# 라우터 등록 - '/api' prefix 제거하여 간결한 URL 사용
app.include_router(auth.auth_router, prefix="/auth", tags=["authentication"])
app.include_router(chat.router, prefix="/chats", tags=["chats"])
app.include_router(character.router, prefix="/characters", tags=["characters"])
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
        "version": "1.0.0",
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


@app.get("/avatars/{avatar_filename}")
async def serve_avatar(avatar_filename: str):
    """
    Serve avatar images directly from /avatars/{filename}
    
    Args:
        avatar_filename: The avatar filename (without extension)
        
    Returns:
        FileResponse: The avatar image file
    """
    from fastapi import HTTPException
    
    # Construct the full path to the avatar file
    avatar_path = Path("app/uploads/avatars") / f"{avatar_filename}.png"
    
    if not avatar_path.exists():
        raise HTTPException(status_code=404, detail="Avatar not found")
    
    return FileResponse(
        path=str(avatar_path),
        media_type="image/png",
        filename=f"avatar_{avatar_filename}.png"
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
