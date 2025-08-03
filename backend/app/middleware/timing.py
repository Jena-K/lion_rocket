import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class TimingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to track and report response times
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Record start time
        start_time = time.time()

        # Store start time in request state
        request.state.start_time = start_time

        # Process request
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Add timing headers
        response.headers["X-Response-Time"] = f"{process_time:.3f}"
        response.headers["X-Response-Time-Ms"] = str(int(process_time * 1000))

        # Add server timing header for browser dev tools
        response.headers["Server-Timing"] = f"total;dur={process_time * 1000:.1f}"

        return response


class PerformanceMiddleware:
    """
    Alternative performance tracking middleware with more metrics
    """

    def __init__(self, app: ASGIApp, slow_request_threshold: float = 1.0):
        self.app = app
        self.slow_request_threshold = slow_request_threshold

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start_time = time.time()
        cpu_start = time.process_time()

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                # Calculate times
                total_time = time.time() - start_time
                cpu_time = time.process_time() - cpu_start

                # Add headers
                headers = list(message.get("headers", []))
                headers.append((b"x-response-time", f"{total_time:.3f}".encode()))
                headers.append((b"x-cpu-time", f"{cpu_time:.3f}".encode()))

                # Log slow requests
                if total_time > self.slow_request_threshold:
                    import logging

                    logger = logging.getLogger(__name__)
                    logger.warning(
                        f"Slow request detected: {scope['method']} {scope['path']} "
                        f"took {total_time:.3f}s"
                    )

                message["headers"] = headers

            await send(message)

        await self.app(scope, receive, send_wrapper)
