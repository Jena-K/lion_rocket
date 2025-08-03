import time
import json
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# Configure logger
logger = logging.getLogger("app.access")


class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests and responses
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Start time
        start_time = time.time()

        # Get request ID if available
        request_id = request.headers.get("X-Request-ID", "no-id")

        # Log request
        logger.info(
            f"Request started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query_params": str(request.query_params),
                "client_host": request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("User-Agent", "unknown"),
            },
        )

        # Process request
        response = await call_next(request)

        # Calculate process time
        process_time = time.time() - start_time

        # Log response
        logger.info(
            f"Request completed",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time": f"{process_time:.3f}s",
                "client_host": request.client.host if request.client else "unknown",
            },
        )

        # Add process time header
        response.headers["X-Process-Time"] = f"{process_time:.3f}"

        return response


class AccessLogMiddleware:
    """
    Alternative access log middleware with structured logging
    """

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start_time = time.time()

        # Extract request info
        method = scope["method"]
        path = scope["path"]
        query_string = scope["query_string"].decode() if scope["query_string"] else ""

        # Process request
        status_code = None

        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            await send(message)

        await self.app(scope, receive, send_wrapper)

        # Log access
        duration = time.time() - start_time

        log_data = {
            "timestamp": time.time(),
            "method": method,
            "path": path,
            "query": query_string,
            "status": status_code,
            "duration_ms": int(duration * 1000),
            "client": scope.get("client", ["unknown", None])[0],
        }

        # Log as JSON for structured logging
        logger.info(json.dumps(log_data))
