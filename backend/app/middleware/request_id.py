import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Middleware to add unique request ID to each request
    """

    def __init__(self, app: ASGIApp, header_name: str = "X-Request-ID"):
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check if request already has an ID
        request_id = request.headers.get(self.header_name)

        # Generate new ID if not present
        if not request_id:
            request_id = str(uuid.uuid4())

        # Store request ID in request state for access in routes
        request.state.request_id = request_id

        # Process request
        response = await call_next(request)

        # Add request ID to response headers
        response.headers[self.header_name] = request_id

        return response


def get_request_id(request: Request) -> str:
    """
    Helper function to get request ID from request state
    """
    return getattr(request.state, "request_id", "unknown")
