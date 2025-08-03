from typing import Callable
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    """
    Middleware to limit request body size
    """

    def __init__(self, app: ASGIApp, max_size: int = 1024 * 1024):  # 1MB default
        super().__init__(app)
        self.max_size = max_size

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check Content-Length header
        content_length = request.headers.get("content-length")

        if content_length:
            content_length = int(content_length)
            if content_length > self.max_size:
                raise HTTPException(
                    status_code=413,
                    detail=f"Request body too large. Max size: {self.max_size} bytes",
                )

        # For chunked requests without Content-Length
        # We'll check the actual body size during reading
        request.state.max_body_size = self.max_size

        return await call_next(request)


class ContentTypeValidationMiddleware:
    """
    Middleware to validate Content-Type headers
    """

    def __init__(
        self, app: ASGIApp, allowed_content_types: list = None, excluded_paths: list = None
    ):
        self.app = app
        self.allowed_content_types = allowed_content_types or [
            "application/json",
            "application/x-www-form-urlencoded",
            "multipart/form-data",
        ]
        self.excluded_paths = excluded_paths or ["/docs", "/redoc", "/openapi.json"]

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope["path"]
        method = scope["method"]

        # Skip validation for excluded paths
        if any(path.startswith(excluded) for excluded in self.excluded_paths):
            await self.app(scope, receive, send)
            return

        # Skip validation for GET, HEAD, OPTIONS requests
        if method in ["GET", "HEAD", "OPTIONS"]:
            await self.app(scope, receive, send)
            return

        # Check Content-Type header
        headers = dict(scope["headers"])
        content_type = headers.get(b"content-type", b"").decode().split(";")[0].strip()

        if content_type and content_type not in self.allowed_content_types:
            await self._send_error_response(
                send,
                status=415,
                detail=f"Unsupported Media Type. Allowed: {', '.join(self.allowed_content_types)}",
            )
            return

        await self.app(scope, receive, send)

    async def _send_error_response(self, send, status: int, detail: str):
        await send(
            {
                "type": "http.response.start",
                "status": status,
                "headers": [(b"content-type", b"application/json")],
            }
        )
        await send(
            {
                "type": "http.response.body",
                "body": f'{{"detail":"{detail}","status":{status}}}'.encode(),
            }
        )
