#!/usr/bin/env python3
"""
Script to initialize database and create default characters
"""
import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import create_tables
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_database():
    """Initialize database tables"""
    try:
        logger.info("Creating database tables...")
        await create_tables()
        logger.info("Database tables created successfully!")
        logger.info(f"Database URL: {settings.DATABASE_URL}")
        
        # Check if database file exists
        if "sqlite" in settings.DATABASE_URL:
            db_path = settings.DATABASE_URL.replace("sqlite:///", "")
            if Path(db_path).exists():
                logger.info(f"Database file exists at: {db_path}")
                logger.info(f"Database file size: {Path(db_path).stat().st_size} bytes")
            else:
                logger.warning(f"Database file not found at: {db_path}")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(init_database())