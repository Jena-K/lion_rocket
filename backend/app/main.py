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
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Authorization",
        "Content-Type",
        "X-Request-ID",
        "X-Correlation-ID", 
        "X-User-ID",
        "Origin",
        "Referer",
        "User-Agent",
        "Cache-Control",
        "Pragma",
        "Expires",
        "X-Requested-With"
    ],
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


@app.get("/images/avatars/{avatar_url}")
async def serve_avatar_image(avatar_url: str):
    """
    Serve avatar images from /images/{avatar_url} endpoint
    
    This endpoint serves character avatar images stored in the uploads/avatars directory.
    The frontend can access avatars using: GET /images/avatars/{avatar_url}
    
    Args:
        avatar_url: The avatar URL (without extension)
        
    Returns:
        FileResponse: The avatar image file (PNG format)
        
    Raises:
        HTTPException: 400 if path traversal detected, 404 if file not found
    """
    from fastapi import HTTPException
    
    # Prevent path traversal attacks
    if '..' in avatar_url or '/' in avatar_url or '\\' in avatar_url:
        raise HTTPException(
            status_code=400,
            detail="Invalid avatar URL. Path traversal not allowed."
        )
    
    # Construct the full path to the avatar file
    avatar_path = Path("uploads/avatars") / f"{avatar_url}.png"
    
    # Ensure the path is within the allowed directory
    try:
        avatar_path = avatar_path.resolve()
        uploads_dir = Path("uploads/avatars").resolve()
        if not str(avatar_path).startswith(str(uploads_dir)):
            raise HTTPException(
                status_code=400,
                detail="Invalid avatar path"
            )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid avatar path"
        )
    
    # Check if file exists
    if not avatar_path.exists():
        raise HTTPException(
            status_code=404, 
            detail="Avatar image not found"
        )
    
    # Check if it's actually a file (not a directory)
    if not avatar_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Avatar path is not a file"
        )
    
    return FileResponse(
        path=str(avatar_path),
        media_type="image/png",
        filename=f"avatar_{avatar_url}.png",
        headers={
            "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
            "X-Content-Type-Options": "nosniff",
            "Access-Control-Allow-Origin": "*",  # Allow cross-origin requests for images
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )


@app.get("/images/avatar/{parameter}")
async def serve_avatar_generic(parameter: str):
    """
    Serve avatar images from /backend/uploads/avatars/{parameter}.png
    
    This endpoint serves avatar PNG images based on a generic parameter.
    The frontend can access avatars using: GET /images/avatar/{parameter}
    
    Args:
        parameter: The avatar identifier (without .png extension)
        
    Returns:
        FileResponse: The avatar image file (PNG format)
        
    Raises:
        HTTPException: 400 if parameter is invalid, 404 if file not found
    """
    from fastapi import HTTPException
    import re
    import os
    
    # Basic validation - allow alphanumeric, underscore, and hyphen
    if not re.match(r'^[a-zA-Z0-9_-]+$', parameter):
        raise HTTPException(
            status_code=400, 
            detail="Invalid parameter format. Only alphanumeric characters, underscores, and hyphens are allowed."
        )
    
    # Prevent path traversal attacks
    if '..' in parameter or '/' in parameter or '\\' in parameter:
        raise HTTPException(
            status_code=400,
            detail="Invalid parameter. Path traversal not allowed."
        )
    
    # Construct the full path to the avatar file - using absolute path from backend root
    backend_root = Path(__file__).parent.parent  # Goes up from app/main.py to backend/
    avatar_path = backend_root / "uploads" / "avatars" / f"{parameter}.png"
    
    # Ensure the path is within the allowed directory
    try:
        avatar_path = avatar_path.resolve()
        uploads_dir = (backend_root / "uploads" / "avatars").resolve()
        if not str(avatar_path).startswith(str(uploads_dir)):
            raise HTTPException(
                status_code=400,
                detail="Invalid avatar path"
            )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid avatar path"
        )
    
    # Check if file exists
    if not avatar_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"Avatar image not found: {parameter}.png"
        )
    
    # Check if it's actually a file (not a directory)
    if not avatar_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Avatar path is not a file"
        )
    
    return FileResponse(
        path=str(avatar_path),
        media_type="image/png",
        filename=f"{parameter}.png",
        headers={
            "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
            "X-Content-Type-Options": "nosniff",
            "Access-Control-Allow-Origin": "*",  # Allow cross-origin requests for images
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )


@app.get("/avatars/{avatar_filename}")
async def serve_avatar(avatar_filename: str):
    """
    Serve avatar images
    
    This endpoint serves character avatar images stored in the uploads/avatars directory.
    The frontend can access avatars using: GET /avatars/{avatar_filename}
    
    Args:
        avatar_filename: The avatar filename (without extension)
        
    Returns:
        FileResponse: The avatar image file (PNG format)
        
    Raises:
        HTTPException: 400 if path traversal detected, 404 if file not found
    """
    from fastapi import HTTPException
    
    # Prevent path traversal attacks
    if '..' in avatar_filename or '/' in avatar_filename or '\\' in avatar_filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid avatar filename. Path traversal not allowed."
        )
    
    # Construct the full path to the avatar file
    avatar_path = Path("app/uploads/avatars") / f"{avatar_filename}.png"
    
    # Ensure the path is within the allowed directory
    try:
        avatar_path = avatar_path.resolve()
        uploads_dir = Path("app/uploads/avatars").resolve()
        if not str(avatar_path).startswith(str(uploads_dir)):
            raise HTTPException(
                status_code=400,
                detail="Invalid avatar path"
            )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid avatar path"
        )
    
    # Check if file exists
    if not avatar_path.exists():
        raise HTTPException(
            status_code=404, 
            detail="Avatar image not found"
        )
    
    # Check if it's actually a file (not a directory)
    if not avatar_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Avatar path is not a file"
        )
    
    return FileResponse(
        path=str(avatar_path),
        media_type="image/png",
        filename=f"avatar_{avatar_filename}.png",
        headers={
            "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
            "X-Content-Type-Options": "nosniff"
        }
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
