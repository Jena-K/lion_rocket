import sys
import traceback
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from app.middleware.request_id import get_request_id

logger = logging.getLogger(__name__)


class ErrorTrackingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to track and log errors with context
    """

    def __init__(self, app: ASGIApp, capture_body: bool = False):
        super().__init__(app)
        self.capture_body = capture_body

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            # Get request context
            request_id = get_request_id(request)

            # Log error with context
            error_context = {
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query_params": str(request.query_params),
                "client": request.client.host if request.client else "unknown",
                "user_agent": request.headers.get("user-agent", "unknown"),
                "error_type": type(exc).__name__,
                "error_message": str(exc),
                "traceback": traceback.format_exc(),
            }

            # Log headers (exclude sensitive ones)
            safe_headers = {
                k: v
                for k, v in request.headers.items()
                if k.lower() not in ["authorization", "cookie", "x-api-key"]
            }
            error_context["headers"] = safe_headers

            # Log error
            logger.error(
                f"Unhandled exception in request {request_id}", extra=error_context, exc_info=True
            )

            # Re-raise the exception to be handled by exception handlers
            raise


class SentryMiddleware:
    """
    Middleware for Sentry error tracking integration
    """

    def __init__(self, app: ASGIApp, dsn: str = None):
        self.app = app
        self.sentry_sdk = None

        if dsn:
            try:
                import sentry_sdk
                from sentry_sdk.integrations.asgi import SentryAsgiMiddleware

                sentry_sdk.init(dsn=dsn, traces_sample_rate=0.1, environment="production")
                self.sentry_sdk = sentry_sdk
                self.app = SentryAsgiMiddleware(app)
            except ImportError:
                logger.warning("Sentry SDK not installed. Error tracking disabled.")

    async def __call__(self, scope, receive, send):
        if self.sentry_sdk and scope["type"] == "http":
            # Add request context to Sentry
            with self.sentry_sdk.configure_scope() as sentry_scope:
                # Add request info
                sentry_scope.set_tag("method", scope["method"])
                sentry_scope.set_tag("path", scope["path"])

                # Add headers
                headers = dict(scope["headers"])
                if b"x-request-id" in headers:
                    sentry_scope.set_tag("request_id", headers[b"x-request-id"].decode())

        await self.app(scope, receive, send)
