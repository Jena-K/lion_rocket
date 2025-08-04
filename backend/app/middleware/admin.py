"""
Admin-specific middleware for enhanced security, logging, and monitoring
"""
import json
import time
from typing import Callable, Optional
from datetime import datetime
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import logging
from app.database import AsyncSessionLocal
from app.models import User
from sqlalchemy import select
from jose import jwt, JWTError
from app.core.config import settings

logger = logging.getLogger(__name__)


class AdminAuditLogMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all admin actions for audit purposes
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.sensitive_endpoints = [
            "/admin/users",
            "/admin/characters",
            "/admin/stats",
            "/admin/dashboard"
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Only log admin endpoints, but skip CORS preflight requests
        if not request.url.path.startswith("/admin") or request.method == "OPTIONS":
            return await call_next(request)
        
        # Capture request info
        start_time = time.time()
        request_body = None
        
        # Get user info from JWT token for audit logging
        admin_username = "unknown"
        admin_id = None
        
        # Extract user info from JWT token
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = jwt.decode(
                    token, 
                    settings.JWT_SECRET_KEY, 
                    algorithms=[settings.JWT_ALGORITHM]
                )
                admin_username = payload.get("sub", "unknown")
                # For audit purposes, we'll use username as identifier
                # In production, you might want to store user_id in JWT payload
            except Exception as e:
                logger.debug(f"Could not extract user from token: {e}")
        
        # Log request details
        if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            try:
                # Read body for audit log (be careful with large bodies)
                body_bytes = await request.body()
                if body_bytes and len(body_bytes) < 10000:  # 10KB limit for logging
                    try:
                        request_body = json.loads(body_bytes.decode())
                        # Remove sensitive fields
                        if "password" in request_body:
                            request_body["password"] = "***REDACTED***"
                    except json.JSONDecodeError:
                        request_body = "<non-json-body>"
                
                # Recreate request with body
                async def receive():
                    return {"type": "http.request", "body": body_bytes}
                
                request = Request(request.scope, receive)
            except Exception as e:
                logger.error(f"Error reading request body: {e}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate response time
        process_time = time.time() - start_time
        
        # Log admin action
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "admin_id": admin_id,
            "admin_username": admin_username,
            "method": request.method,
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "request_body": request_body,
            "status_code": response.status_code,
            "process_time": f"{process_time:.3f}s",
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
        }
        
        # Log level based on action type
        if request.method == "DELETE" or "delete" in request.url.path:
            logger.warning(f"ADMIN DELETE ACTION: {json.dumps(log_data)}")
        elif request.method in ["POST", "PUT", "PATCH"]:
            logger.info(f"ADMIN MODIFY ACTION: {json.dumps(log_data)}")
        else:
            logger.info(f"ADMIN READ ACTION: {json.dumps(log_data)}")
        
        return response


class AdminRateLimitMiddleware(BaseHTTPMiddleware):
    """
    Specific rate limiting for admin endpoints
    """
    
    def __init__(self, app: ASGIApp, 
                 read_limit: int = 100,  # per minute
                 write_limit: int = 30,  # per minute
                 delete_limit: int = 10):  # per minute
        super().__init__(app)
        self.read_limit = read_limit
        self.write_limit = write_limit
        self.delete_limit = delete_limit
        self.request_counts = {}  # Simple in-memory store
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip admin middleware for non-admin endpoints and CORS preflight requests
        if not request.url.path.startswith("/admin") or request.method == "OPTIONS":
            return await call_next(request)
        
        # Get user identifier from JWT token
        user_key = None
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = jwt.decode(
                    token, 
                    settings.JWT_SECRET_KEY, 
                    algorithms=[settings.JWT_ALGORITHM]
                )
                username = payload.get("sub")
                if username:
                    user_key = f"admin_{username}"
            except Exception:
                pass
        
        if not user_key:
            # If we can't identify the user, let the request through
            # The auth dependency will handle authentication
            return await call_next(request)
        current_minute = int(time.time() // 60)
        
        # Determine rate limit based on method
        if request.method == "GET":
            limit = self.read_limit
            action = "read"
        elif request.method == "DELETE":
            limit = self.delete_limit
            action = "delete"
        else:
            limit = self.write_limit
            action = "write"
        
        # Check rate limit
        rate_key = f"{user_key}:{action}:{current_minute}"
        
        if rate_key not in self.request_counts:
            self.request_counts[rate_key] = 0
        
        self.request_counts[rate_key] += 1
        
        # Clean old entries (older than 2 minutes)
        self._clean_old_entries(current_minute)
        
        if self.request_counts[rate_key] > limit:
            logger.warning(f"Admin rate limit exceeded for {user_key} - {action}")
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {limit} {action} requests per minute."
            )
        
        return await call_next(request)
    
    def _clean_old_entries(self, current_minute: int):
        """Remove entries older than 2 minutes"""
        keys_to_remove = []
        for key in self.request_counts:
            minute = int(key.split(":")[-1])
            if current_minute - minute > 2:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.request_counts[key]


class AdminSecurityMiddleware(BaseHTTPMiddleware):
    """
    Enhanced security checks for admin endpoints
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.suspicious_patterns = [
            "../",  # Path traversal
            "<script",  # XSS attempt
            "DROP TABLE",  # SQL injection
            "DELETE FROM",  # SQL injection
            "UNION SELECT",  # SQL injection
        ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip admin middleware for non-admin endpoints and CORS preflight requests
        if not request.url.path.startswith("/admin") or request.method == "OPTIONS":
            return await call_next(request)
        
        # Check for suspicious patterns in URL
        url_str = str(request.url)
        for pattern in self.suspicious_patterns:
            if pattern.lower() in url_str.lower():
                logger.error(f"Suspicious pattern detected in admin request: {pattern} in {url_str}")
                raise HTTPException(
                    status_code=400,
                    detail="Invalid request"
                )
        
        # Note: Admin verification is handled by the require_admin dependency
        # This middleware focuses on security patterns and headers
        
        # Add security headers specifically for admin responses
        response = await call_next(request)
        
        # Enhanced security headers for admin endpoints
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response


class AdminRequestValidationMiddleware(BaseHTTPMiddleware):
    """
    Additional validation for admin requests
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip admin middleware for non-admin endpoints and CORS preflight requests
        if not request.url.path.startswith("/admin") or request.method == "OPTIONS":
            return await call_next(request)
        
        # Validate query parameters
        query_params = request.query_params
        
        # Check pagination parameters
        if "page" in query_params:
            try:
                page = int(query_params["page"])
                if page < 1 or page > 10000:
                    raise HTTPException(
                        status_code=400,
                        detail="Invalid page number. Must be between 1 and 10000."
                    )
            except ValueError:
                raise HTTPException(
                    status_code=400,
                    detail="Page must be a valid integer"
                )
        
        
        
        return await call_next(request)


# Convenience function to add all admin middleware
def add_admin_middleware(app):
    """Add all admin-specific middleware to the application"""
    app.add_middleware(AdminRequestValidationMiddleware)
    app.add_middleware(AdminSecurityMiddleware)
    app.add_middleware(AdminRateLimitMiddleware)
    app.add_middleware(AdminAuditLogMiddleware)