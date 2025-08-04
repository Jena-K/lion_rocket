"""
Create admin user script
Run this script to create an admin user with specified credentials
"""
import asyncio
from sqlalchemy import select
from app.database import engine, AsyncSessionLocal
from app.models import User
from app.core.auth import get_password_hash


async def create_admin_user():
    """Create admin user with predefined credentials"""
    async with AsyncSessionLocal() as db:
        # Check if admin user already exists
        result = await db.execute(select(User).where(User.username == "admin"))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print("Admin user already exists. Updating password...")
            # Update existing admin user
            existing_user.password_hash = get_password_hash("lemonT104!")
            existing_user.is_admin = True
            existing_user.is_active = True
            await db.commit()
            print("Admin password updated successfully!")
        else:
            # Create new admin user
            admin_user = User(
                username="admin",
                email="admin@lionrocket.com",
                password_hash=get_password_hash("lemonT104!"),
                is_admin=True,
                is_active=True
            )
            db.add(admin_user)
            await db.commit()
            print("Admin user created successfully!")
        
        print("\nAdmin credentials:")
        print("Username: admin")
        print("Password: lemonT104!")
        print("\nYou can now login with these credentials.")


if __name__ == "__main__":
    asyncio.run(create_admin_user())