#!/usr/bin/env python3
"""
Script to update all character records in the database to set created_by = 1
This ensures all characters are associated with the admin user (ID: 1)
"""
import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update
from app.models import Character, User
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def update_character_created_by():
    """Update all character records to set created_by = 1"""
    # Convert SQLite URL to async
    db_url = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
    
    # Create async engine
    engine = create_async_engine(db_url, echo=True)
    
    # Create session factory
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            # First, verify that user ID 1 exists (should be admin)
            result = await session.execute(select(User).where(User.id == 1))
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                logger.error("User with ID 1 not found! Please ensure admin user exists before running this script.")
                return False
            
            logger.info(f"Found admin user: {admin_user.username} (ID: {admin_user.id})")
            
            # Get current state of characters before update
            result = await session.execute(select(Character))
            characters_before = result.scalars().all()
            
            logger.info(f"Found {len(characters_before)} characters in database")
            logger.info("Current created_by values:")
            for char in characters_before:
                logger.info(f"- {char.name} (ID: {char.id}): created_by = {char.created_by}")
            
            # Update all characters to set created_by = 1
            update_stmt = update(Character).values(created_by=1)
            result = await session.execute(update_stmt)
            updated_count = result.rowcount
            
            # Commit the changes
            await session.commit()
            
            logger.info(f"Successfully updated {updated_count} character records")
            
            # Verify the update
            result = await session.execute(select(Character))
            characters_after = result.scalars().all()
            
            logger.info("Updated created_by values:")
            for char in characters_after:
                logger.info(f"- {char.name} (ID: {char.id}): created_by = {char.created_by}")
            
            # Double-check all are set to 1
            all_correct = all(char.created_by == 1 for char in characters_after)
            if all_correct:
                logger.info("✅ All character records now have created_by = 1")
                return True
            else:
                logger.error("❌ Some characters still have incorrect created_by values")
                return False
            
        except Exception as e:
            logger.error(f"Error updating character created_by values: {e}")
            await session.rollback()
            raise
        finally:
            await engine.dispose()


async def main():
    """Main function"""
    logger.info("Starting character created_by update process...")
    logger.info("This will set created_by = 1 for ALL characters in the database")
    
    # Ask for confirmation in production environments
    if not settings.DEBUG:
        response = input("Are you sure you want to proceed? (yes/no): ")
        if response.lower() != 'yes':
            logger.info("Operation cancelled by user")
            return
    
    success = await update_character_created_by()
    
    if success:
        logger.info("✅ Character created_by update completed successfully!")
    else:
        logger.error("❌ Character created_by update failed!")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())