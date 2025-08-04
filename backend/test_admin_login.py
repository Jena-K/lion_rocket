"""Test script for admin login endpoint"""
import asyncio
import httpx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models import User
from app.auth.jwt import get_password_hash
from app.database import Base

# Test database URL
DATABASE_URL = "sqlite+aiosqlite:///./test.db"

async def setup_test_admin():
    """Create a test admin user"""
    engine = create_async_engine(DATABASE_URL, echo=True)
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if admin exists
        result = await session.execute(select(User).where(User.username == "admin"))
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            # Create admin user
            admin_user = User(
                username="admin",
                email="admin@lionrocket.com",
                password_hash=get_password_hash("admin123"),
                is_admin=True
            )
            session.add(admin_user)
            await session.commit()
            print("✅ Admin user created")
        else:
            print("ℹ️ Admin user already exists")
    
    await engine.dispose()

async def test_admin_login():
    """Test the admin login endpoint"""
    async with httpx.AsyncClient() as client:
        # Test with correct admin credentials
        response = await client.post(
            "http://localhost:8000/auth/admin/login",
            json={
                "adminId": "admin",
                "password": "admin123"
            }
        )
        
        print(f"\n✅ Admin Login Test:")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Token: {data['access_token'][:20]}...")
            print(f"User: {data['user']['username']} (is_admin: {data['user']['is_admin']})")
        else:
            print(f"Error: {response.text}")
        
        # Test with non-admin user (should fail)
        print(f"\n❌ Non-Admin Login Test (should fail):")
        response = await client.post(
            "http://localhost:8000/auth/admin/login", 
            json={
                "adminId": "regularuser",
                "password": "password123"
            }
        )
        print(f"Status: {response.status_code}")
        print(f"Error: {response.json().get('detail', 'No error message')}")

if __name__ == "__main__":
    print("🚀 Setting up test admin user...")
    asyncio.run(setup_test_admin())
    
    print("\n🔐 Testing admin login endpoint...")
    asyncio.run(test_admin_login())