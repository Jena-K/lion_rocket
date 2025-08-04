# Unified Middleware package for assignment environment
from .rate_limit import (
    limiter,
    rate_limit,
    chat_rate_limit,
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)
from .admin import (
    AdminAuditLogMiddleware,
    AdminRateLimitMiddleware,
    AdminSecurityMiddleware,
    AdminRequestValidationMiddleware,
    add_admin_middleware,
)
from .core import CoreMiddleware, RequestSizeMiddleware

__all__ = [
    # Rate limiting
    "limiter",
    "rate_limit",
    "chat_rate_limit",
    "RateLimitExceeded",
    "_rate_limit_exceeded_handler",
    # Core unified middleware
    "CoreMiddleware",
    "RequestSizeMiddleware",
    # Admin middleware
    "AdminAuditLogMiddleware",
    "AdminRateLimitMiddleware",
    "AdminSecurityMiddleware",
    "AdminRequestValidationMiddleware",
    "add_admin_middleware",
]
