import gzip
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from starlette.datastructures import Headers, MutableHeaders


class CompressionMiddleware(BaseHTTPMiddleware):
    """
    Middleware to compress responses using gzip
    """

    def __init__(self, app: ASGIApp, minimum_size: int = 500, compress_level: int = 6):
        super().__init__(app)
        self.minimum_size = minimum_size
        self.compress_level = compress_level

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check if client accepts gzip
        accept_encoding = request.headers.get("accept-encoding", "")
        if "gzip" not in accept_encoding.lower():
            return await call_next(request)

        # Process request
        response = await call_next(request)

        # Check if response should be compressed
        if not self._should_compress(response):
            return response

        # Read response body
        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        # Check size threshold
        if len(body) < self.minimum_size:
            # Return original response
            return Response(
                content=body,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.media_type,
            )

        # Compress body
        compressed_body = gzip.compress(body, compresslevel=self.compress_level)

        # Update headers
        headers = MutableHeaders(response.headers)
        headers["content-encoding"] = "gzip"
        headers["content-length"] = str(len(compressed_body))
        # Add vary header
        vary = headers.get("vary", "")
        if vary:
            headers["vary"] = f"{vary}, Accept-Encoding"
        else:
            headers["vary"] = "Accept-Encoding"

        return Response(
            content=compressed_body,
            status_code=response.status_code,
            headers=headers,
            media_type=response.media_type,
        )

    def _should_compress(self, response: Response) -> bool:
        """Check if response should be compressed"""
        # Don't compress if already encoded
        if "content-encoding" in response.headers:
            return False

        # Check content type
        content_type = response.headers.get("content-type", "")
        compressible_types = [
            "text/",
            "application/json",
            "application/javascript",
            "application/xml",
            "application/xhtml+xml",
            "application/rss+xml",
            "application/atom+xml",
            "application/x-font-ttf",
            "image/svg+xml",
        ]

        return any(content_type.startswith(ct) for ct in compressible_types)
