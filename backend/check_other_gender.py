"""
Check for any characters with gender 'other' in the database
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
import traceback


async def check_other_gender():
    """Check for characters with gender 'other'"""
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
            print("Checking for characters with gender 'other'...")
            
            # Query for characters with gender 'other'
            result = await db.execute(
                select(Character).where(Character.gender == 'other')
            )
            characters_with_other = result.scalars().all()
            
            print(f"Found {len(characters_with_other)} characters with gender 'other':")
            
            for char in characters_with_other:
                print(f"  - ID: {char.id}, Name: {char.name}, Gender: {char.gender}")
            
            # Query for all characters to see distribution
            result = await db.execute(select(Character))
            all_characters = result.scalars().all()
            
            gender_counts = {}
            for char in all_characters:
                gender_counts[char.gender] = gender_counts.get(char.gender, 0) + 1
            
            print(f"\nGender distribution of all {len(all_characters)} characters:")
            for gender, count in gender_counts.items():
                print(f"  - {gender}: {count}")
                
        except Exception as e:
            print(f"Error occurred: {type(e).__name__}: {e}")
            traceback.print_exc()
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(check_other_gender())