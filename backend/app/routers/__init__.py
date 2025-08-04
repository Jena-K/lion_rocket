# Routers package
from .auth import auth_router
from .chat import router as chat_router
from .character import router as character_router
from .admin import router as admin_router

__all__ = ["auth_router", "chat_router", "character_router", "admin_router"]
