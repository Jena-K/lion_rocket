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
    # Admin middleware
    add_admin_middleware,
)
from app.middleware.core import CoreMiddleware, RequestSizeMiddleware

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

# Add unified middleware (simplified for assignment environment)
# 1. Request size limit - Should be first to reject large requests
app.add_middleware(RequestSizeMiddleware, max_size=5 * 1024 * 1024)

# 2. CORS - Must be before other processing
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000", 
        "http://localhost:8080",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Core middleware - Unified request ID, logging, timing, and security
app.add_middleware(CoreMiddleware, api_version="1.0.0")

# 4. Admin-specific middleware - Enhanced security for admin endpoints
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
    import traceback
    error_detail = f"Unhandled exception in {request.method} {request.url}: {str(exc)}"
    logger.error(error_detail, exc_info=True)
    # Log error details
    # Log traceback details
    return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(exc)}", "status": 500})


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




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
