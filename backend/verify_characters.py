"""
Script to verify the created characters
"""
import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models import Character
from app.core.config import settings


async def verify_characters():
    """Verify the created characters"""
    # Convert SQLite URL to async
    db_url = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    
    # Create async engine
    engine = create_async_engine(db_url, echo=False)
    
    # Create session factory
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            # Get all characters
            result = await session.execute(select(Character))
            characters = result.scalars().all()
            
            print(f"Total characters in database: {len(characters)}\n")
            
            for char in characters:
                print(f"Character ID: {char.id}")
                print(f"Name: {char.name}")
                print(f"Gender: {char.gender.value}")
                print(f"Introduction: {char.intro}")
                print(f"Personality Tags: {', '.join(char.personality_tags)}")
                print(f"Interest Tags: {', '.join(char.interest_tags)}")
                print(f"Is Active: {char.is_active}")
                print(f"Created By (User ID): {char.created_by}")
                print(f"Created At: {char.created_at}")
                print(f"Prompt Length: {len(char.prompt)} characters")
                print("-" * 80)
                print()
            
        except Exception as e:
            print(f"Error verifying characters: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(verify_characters())