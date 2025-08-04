#!/usr/bin/env python3
"""
Test admin endpoint after AdminUserResponse fix
"""
import asyncio
import sys
from pathlib import Path

# Add project root to Python path
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db, engine
from app.models.user import User
from app.models.stats import UsageStat
from app.schemas.user import AdminUserResponse
from sqlalchemy import func

async def test_admin_user_response():
    """Test creating AdminUserResponse with actual database data"""
    print("🧪 Testing AdminUserResponse with database data")
    
    async with AsyncSession(engine) as session:
        try:
            # Get first user from database
            user_result = await session.execute(select(User).limit(1))
            user = user_result.scalar_one_or_none()
            
            if not user:
                print("❌ No users found in database")
                return False
            
            print(f"📋 Testing with user: {user.username}")
            
            # Get user stats (simulate what admin endpoint does)
            total_chats_result = await session.execute(
                select(func.count(func.distinct(Message.character_id)))
                .select_from(Message)
                .where(Message.user_id == user.user_id)
            )
            total_chats = total_chats_result.scalar() or 0
            
            # Get total tokens
            total_tokens_result = await session.execute(
                select(func.coalesce(func.sum(UsageStat.token_count), 0))
                .where(UsageStat.user_id == user.user_id)
            )
            total_tokens = total_tokens_result.scalar() or 0
            
            # Create AdminUserResponse (this should work now)
            admin_response = AdminUserResponse(
                user_id=user.user_id,  # Fixed: use user_id instead of id
                username=user.username,
                email=user.email,
                is_admin=user.is_admin,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at,
                total_chats=total_chats,
                total_tokens=total_tokens,  # Fixed: include total_tokens
                last_active=None
            )
            
            print("✅ AdminUserResponse created successfully!")
            print(f"   user_id: {admin_response.user_id}")
            print(f"   username: {admin_response.username}")
            print(f"   total_chats: {admin_response.total_chats}")
            print(f"   total_tokens: {admin_response.total_tokens}")
            
            return True
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        finally:
            await session.close()

async def main():
    """Main test function"""
    print("=" * 60)
    print("🔧 Admin Endpoint Fix Testing")
    print("=" * 60)
    
    try:
        success = await test_admin_user_response()
        
        if success:
            print("\n✅ AdminUserResponse validation fix is working!")
            print("💡 The admin endpoint should now work correctly")
        else:
            print("\n❌ AdminUserResponse still has issues")
            
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")

if __name__ == "__main__":
    # Import Message here to avoid circular import issues
    from app.models.message import Message
    asyncio.run(main())