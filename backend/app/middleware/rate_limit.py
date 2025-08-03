import os
from fastapi import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


# Create limiter instance
def get_identifier(request: Request):
    """Get identifier for rate limiting (IP address or user ID if authenticated)"""
    # Try to get user ID from JWT token if available
    try:
        from app.auth.dependencies import get_current_user_optional
        from app.database import SessionLocal

        # Get authorization header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            db = SessionLocal()
            try:
                user = get_current_user_optional(token=token, db=db)
                if user:
                    return f"user:{user.id}"
            finally:
                db.close()
    except:
        pass

    # Fallback to IP address
    return get_remote_address(request)


# Create limiter with custom key function
limiter = Limiter(key_func=get_identifier)

# Rate limit configurations from environment
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "100"))
CHAT_RATE_LIMIT_PER_MINUTE = int(os.getenv("CHAT_RATE_LIMIT_PER_MINUTE", "20"))


# Standard rate limit decorator
def rate_limit(limit: str = f"{RATE_LIMIT_PER_MINUTE}/minute"):
    """Standard rate limit decorator"""
    return limiter.limit(limit)


# Chat-specific rate limit decorator
def chat_rate_limit(limit: str = f"{CHAT_RATE_LIMIT_PER_MINUTE}/minute"):
    """Chat-specific rate limit decorator"""
    return limiter.limit(limit)


# Export for use in main.py
__all__ = [
    "limiter",
    "rate_limit",
    "chat_rate_limit",
    "RateLimitExceeded",
    "_rate_limit_exceeded_handler",
]
