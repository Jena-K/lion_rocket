"""
Verify admin user exists
"""
import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import User
from app.core.auth import verify_password


async def verify_admin():
    """Verify admin user exists and password works"""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == "admin"))
        admin_user = result.scalar_one_or_none()
        
        if admin_user:
            print(f"[OK] Admin user found!")
            print(f"  - Username: {admin_user.username}")
            print(f"  - Email: {admin_user.email}")
            print(f"  - Is Admin: {admin_user.is_admin}")
            print(f"  - Is Active: {admin_user.is_active}")
            print(f"  - Created: {admin_user.created_at}")
            
            # Test password
            if verify_password("lemonT104!", admin_user.password_hash):
                print("[OK] Password verification successful!")
            else:
                print("[ERROR] Password verification failed!")
        else:
            print("[ERROR] Admin user not found!")


if __name__ == "__main__":
    asyncio.run(verify_admin())