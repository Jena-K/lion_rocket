"""
Test if all imports in admin.py are working correctly
"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    print("Testing imports from admin.py...")
    
    print("1. Importing base modules...")
    from typing import List, Optional
    from datetime import datetime, date, timedelta
    from fastapi import APIRouter, Depends, HTTPException, Query
    from sqlalchemy.ext.asyncio import AsyncSession
    from sqlalchemy import func, and_, select, or_
    print("   [OK] Base modules imported successfully")
    
    print("\n2. Importing database and auth...")
    from app.database import get_db
    from app.auth.dependencies import require_admin
    print("   [OK] Database and auth imported successfully")
    
    print("\n3. Importing models...")
    from app.models import User, Message, UsageStat, Character
    print("   [OK] Models imported successfully")
    
    print("\n4. Importing schemas...")
    # Test the fixed imports
    from app.schemas.user import AdminUserResponse, AdminUserPaginatedResponse
    print("   [OK] User schemas imported successfully")
    
    from app.schemas.stats import AdminStatsResponse, UsageStatResponse
    print("   [OK] Stats schemas imported successfully")
    
    from app.schemas.chat import ChatResponse, ChatPaginatedResponse
    print("   [OK] Chat schemas imported successfully")
    
    from app.schemas.character import CharacterCreate, CharacterUpdate, CharacterResponse, CharacterListResponse
    print("   [OK] Character schemas imported successfully")
    
    from app.schemas.user import UserUpdate, UserResponse
    print("   [OK] Additional user schemas imported successfully")
    
    print("\n5. Importing services...")
    from app.services import chat_service
    print("   [OK] Services imported successfully")
    
    print("\n[SUCCESS] All imports are working correctly!")
    
except ImportError as e:
    print(f"\n[ERROR] Import error: {e}")
    print(f"   Module: {e.name if hasattr(e, 'name') else 'Unknown'}")
    print(f"   Path: {e.path if hasattr(e, 'path') else 'Unknown'}")
    import traceback
    traceback.print_exc()
except Exception as e:
    print(f"\n[ERROR] Unexpected error: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()