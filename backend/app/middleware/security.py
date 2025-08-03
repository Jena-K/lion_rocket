from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add security headers to all responses
    """

    def __init__(
        self,
        app: ASGIApp,
        content_security_policy: str = None,
        strict_transport_security: str = "max-age=31536000; includeSubDomains",
    ):
        super().__init__(app)
        self.content_security_policy = content_security_policy or self._default_csp()
        self.strict_transport_security = strict_transport_security

    def _default_csp(self) -> str:
        """Default Content Security Policy"""
        return (
            "default-src 'self'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https: data:; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https:; "
            "connect-src 'self' https://api.anthropic.com"
        )

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(), "
            "gyroscope=(), magnetometer=(), microphone=(), "
            "payment=(), usb=()"
        )

        # Add CSP header
        if self.content_security_policy:
            response.headers["Content-Security-Policy"] = self.content_security_policy

        # Add HSTS header for HTTPS connections
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = self.strict_transport_security

        return response


class APISecurityMiddleware:
    """
    Additional API-specific security middleware
    """

    def __init__(self, app: ASGIApp, api_version: str = "1.0"):
        self.app = app
        self.api_version = api_version

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))

                # Add API version header
                headers.append((b"x-api-version", self.api_version.encode()))

                # Remove server header for security
                headers = [h for h in headers if h[0].lower() != b"server"]

                # Add custom server header
                headers.append((b"server", b"LionRocket API"))

                message["headers"] = headers

            await send(message)

        await self.app(scope, receive, send_wrapper)
