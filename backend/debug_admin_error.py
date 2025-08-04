"""
Debug script to test admin users endpoint and find the 500 error
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
from app.core.config import settings
import traceback


async def test_admin_users_query():
    """Test the queries used in the admin users endpoint"""
    # Convert SQLite URL to async
    db_url = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    
    # Create async engine
    engine = create_async_engine(db_url, echo=True)
    
    # Create session factory
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as db:
        try:
            print("1. Testing user count query...")
            total_result = await db.execute(select(func.count()).select_from(User))
            total = total_result.scalar()
            print(f"   Total users: {total}")
            
            print("\n2. Testing user pagination query...")
            users_result = await db.execute(select(User).limit(5))
            users = users_result.scalars().all()
            print(f"   Found {len(users)} users")
            
            if users:
                user = users[0]
                print(f"\n3. Testing stats queries for user {user.username} (ID: {user.id})...")
                
                # Test total chats query
                print("   a. Testing total chats query...")
                total_chats_result = await db.execute(
                    select(func.count()).select_from(Chat).where(Chat.user_id == user.id)
                )
                total_chats = total_chats_result.scalar()
                print(f"      Total chats: {total_chats}")
                
                # Test total tokens query - THIS IS WHERE THE ERROR LIKELY IS
                print("   b. Testing total tokens query...")
                total_tokens_result = await db.execute(
                    select(func.sum(UsageStat.total_tokens))
                    .select_from(UsageStat)
                    .where(UsageStat.user_id == user.id)
                )
                total_tokens = total_tokens_result.scalar() or 0
                print(f"      Total tokens: {total_tokens}")
                
                # Test last activity query
                print("   c. Testing last activity query...")
                last_chat_result = await db.execute(
                    select(Chat)
                    .where(Chat.user_id == user.id)
                    .order_by(Chat.last_message_at.desc())
                    .limit(1)
                )
                last_chat = last_chat_result.scalar_one_or_none()
                last_active = last_chat.last_message_at if last_chat else None
                print(f"      Last active: {last_active}")
                
            print("\n✅ All queries executed successfully!")
            
        except Exception as e:
            print(f"\n❌ Error occurred: {type(e).__name__}: {e}")
            traceback.print_exc()
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_admin_users_query())