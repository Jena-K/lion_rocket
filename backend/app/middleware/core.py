# Core Middleware - Unified essential middleware for assignment environment
import time
import uuid
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class CoreMiddleware(BaseHTTPMiddleware):
    """Unified core middleware combining request ID, logging, timing, and security"""

    def __init__(self, app: ASGIApp, api_version: str = "1.0.0"):
        super().__init__(app)
        self.api_version = api_version

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 1. Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # 2. Start timing
        start_time = time.time()

        # 3. Log request
        logger.info(
            f"Request {request_id}: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )

        try:
            # Process request
            response = await call_next(request)

            # 4. Calculate timing
            process_time = time.time() - start_time

            # 5. Add security headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-API-Version"] = self.api_version
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
            response.headers["X-Process-Time"] = str(process_time)

            # 6. Log response
            logger.info(
                f"Response {request_id}: {response.status_code} "
                f"({process_time:.3f}s)"
            )

            return response

        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Error {request_id}: {str(e)} ({process_time:.3f}s)", 
                exc_info=True
            )
            raise


class RequestSizeMiddleware(BaseHTTPMiddleware):
    """Request size limitation middleware"""

    def __init__(self, app: ASGIApp, max_size: int = 5 * 1024 * 1024):  # 5MB
        super().__init__(app)
        self.max_size = max_size

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if request.headers.get("content-length"):
            content_length = int(request.headers["content-length"])
            if content_length > self.max_size:
                logger.warning(f"Request too large: {content_length} bytes")
                return Response(
                    content="Request entity too large",
                    status_code=413
                )
        
        return await call_next(request)