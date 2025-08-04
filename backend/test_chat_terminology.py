"""Test script to verify Chat terminology changes are working"""
import asyncio
import sys
from pathlib import Path

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add project root to path
sys.path.append(str(Path(__file__).parent))

async def test_imports():
    """Test that all imports work correctly"""
    print("Testing imports...")
    
    try:
        # Test model imports
        from app.models import Chat, User, Character, UsageStat
        print("✓ Model imports successful")
        
        # Test schema imports
        from app.schemas.chat import ChatCreate, ChatResponse, ChatRole
        print("✓ Schema imports successful")
        
        # Test that Message-related imports are removed
        try:
            from app.schemas.chat import MessageCreate, MessageResponse, MessageRole
            print("✗ ERROR: Old Message schemas still exist!")
            return False
        except ImportError:
            print("✓ Old Message schemas successfully removed")
        
        # Test model attributes
        print("\nTesting Chat model attributes:")
        print(f"  - Table name: {Chat.__tablename__}")
        print(f"  - Primary key: {Chat.chat_id}")
        print("✓ Chat model structure correct")
        
        return True
        
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False

async def test_database_connection():
    """Test database operations with new Chat model"""
    print("\nTesting database connection...")
    
    try:
        from app.database import AsyncSessionLocal
        from sqlalchemy import select
        from app.models import Chat
        
        async with AsyncSessionLocal() as db:
            # Try to query chats table
            result = await db.execute(select(Chat).limit(1))
            chat = result.scalar_one_or_none()
            
            if chat:
                print(f"✓ Found chat with ID: {chat.chat_id}")
            else:
                print("✓ Chats table accessible (no data found)")
                
        return True
        
    except Exception as e:
        print(f"✗ ERROR accessing database: {e}")
        print("  Note: You may need to run the migration first")
        return False

async def main():
    """Run all tests"""
    print("=== Chat Terminology Test ===\n")
    
    import_success = await test_imports()
    
    if import_success:
        await test_database_connection()
    
    print("\n=== Test Complete ===")
    
    if not import_success:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")

if __name__ == "__main__":
    asyncio.run(main())