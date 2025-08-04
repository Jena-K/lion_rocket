"""
Test the admin users endpoint directly to find the exact error
"""
import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, func
from app.models import User, Message, UsageStat
from app.schemas.user import AdminUserResponse, AdminUserPaginatedResponse
from app.core.config import settings
import traceback


async def test_admin_users_endpoint():
    """Test the admin users endpoint logic directly"""
    # Convert SQLite URL to async
    db_url = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    
    # Create async engine
    engine = create_async_engine(db_url, echo=False)
    
    # Create session factory
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as db:
        try:
            # Parameters
            page = 1
            limit = 20
            skip = (page - 1) * limit
            
            print("1. Getting total user count...")
            total_result = await db.execute(select(func.count()).select_from(User))
            total = total_result.scalar()
            print(f"   Total users: {total}")
            
            print("\n2. Getting users with pagination...")
            users_result = await db.execute(select(User).offset(skip).limit(limit))
            users = users_result.scalars().all()
            print(f"   Found {len(users)} users")
            
            # Build response with stats for each user
            user_responses = []
            for user in users:
                print(f"\n3. Processing user {user.username} (ID: {user.id})...")
                
                # Get user stats
                total_chats_result = await db.execute(
                    select(func.count()).select_from(Chat).where(Chat.user_id == user.id)
                )
                total_chats = total_chats_result.scalar()
                print(f"   Total chats: {total_chats}")
                
                total_tokens_result = await db.execute(
                    select(func.sum(UsageStat.total_tokens))
                    .select_from(UsageStat)
                    .where(UsageStat.user_id == user.id)
                )
                total_tokens = total_tokens_result.scalar() or 0
                print(f"   Total tokens: {total_tokens}")
                
                # Get last activity
                last_chat_result = await db.execute(
                    select(Chat)
                    .where(Chat.user_id == user.id)
                    .order_by(Chat.last_message_at.desc())
                    .limit(1)
                )
                last_chat = last_chat_result.scalar_one_or_none()
                last_active = last_chat.last_message_at if last_chat else None
                print(f"   Last active: {last_active}")
                
                # Create response
                print("   Creating AdminUserResponse...")
                print(f"   User data: id={user.id}, username={user.username}, is_active={user.is_active}, updated_at={user.updated_at}")
                user_response = AdminUserResponse(
                    id=user.id,
                    username=user.username,
                    email=user.email,
                    is_admin=user.is_admin,
                    is_active=user.is_active,
                    created_at=user.created_at,
                    updated_at=user.updated_at,
                    total_chats=total_chats,
                    total_tokens=total_tokens,
                    last_active=last_active,
                )
                user_responses.append(user_response)
                print("   [OK] User response created")
            
            print("\n4. Creating paginated response...")
            paginated_response = AdminUserPaginatedResponse(
                items=user_responses,
                total=total,
                page=page,
                pages=(total + limit - 1) // limit,
                limit=limit,
            )
            print("   [OK] Paginated response created")
            
            print(f"\n[SUCCESS] Response would contain {len(paginated_response.items)} users")
            print(f"Total pages: {paginated_response.pages}")
            
        except Exception as e:
            print(f"\n[ERROR] Exception occurred: {type(e).__name__}: {e}")
            traceback.print_exc()
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_admin_users_endpoint())