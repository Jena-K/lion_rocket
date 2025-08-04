#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Create test user for chat testing"""

import asyncio
import sys
import io
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import User
from app.core.auth import get_password_hash

# Windows UTF-8
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

async def create_test_user():
    """Create a test user in the database"""
    async with AsyncSessionLocal() as session:
        try:
            # Check if user exists
            result = await session.execute(
                select(User).where(User.username == "testuser")
            )
            if result.scalar_one_or_none():
                print("ℹ️ Test user already exists")
                return
            
            # Create new user
            user = User(
                username="testuser",
                email="testuser@example.com",
                hashed_password=get_password_hash("testpass123"),
                is_active=True,
                is_superuser=False,
                created_at="2025-08-04T00:00:00"
            )
            
            session.add(user)
            await session.commit()
            print("✅ Test user created successfully!")
            
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            await session.rollback()

if __name__ == "__main__":
    asyncio.run(create_test_user())