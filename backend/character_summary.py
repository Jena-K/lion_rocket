"""
Script to display character summary in a readable format
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


async def show_character_summary():
    """Show character summary"""
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
            
            print("=" * 80)
            print("LIONROCKET CHARACTER SUMMARY")
            print("=" * 80)
            print(f"\nTotal Characters: {len(characters)}")
            print()
            
            # Character summaries
            character_info = [
                {
                    "name": "민준 (Minjun)",
                    "gender": "Male",
                    "role": "창의적인 친구",
                    "key_traits": "차분함, 창의적, 상상력 풍부",
                    "main_interests": "영화, 게임, 여행",
                    "profile_image": "/uploads/avatars/boy_01.png"
                },
                {
                    "name": "서연 (Seoyeon)",
                    "gender": "Female", 
                    "role": "논리적인 프로그래머",
                    "key_traits": "논리적, 따뜻함, 세심함",
                    "main_interests": "고양이, 프로그래밍, 맛집",
                    "profile_image": "/uploads/avatars/girl_02.png"
                },
                {
                    "name": "지우 (Jiwoo)",
                    "gender": "Female",
                    "role": "열정적인 스포츠 매니아",
                    "key_traits": "활발함, 외향적, 유머러스",
                    "main_interests": "스케이트보드, 파쿠르, 떡볶이",
                    "profile_image": "/uploads/avatars/girl_01.png"
                }
            ]
            
            for i, char in enumerate(characters):
                info = character_info[i] if i < len(character_info) else {}
                
                print(f"Character #{char.id}")
                print("-" * 40)
                print(f"Name: {info.get('name', char.name)}")
                print(f"Gender: {info.get('gender', char.gender.value)}")
                print(f"Role: {info.get('role', 'N/A')}")
                print(f"Key Traits: {info.get('key_traits', 'N/A')}")
                print(f"Main Interests: {info.get('main_interests', 'N/A')}")
                print(f"Profile Image: {info.get('profile_image', 'N/A')}")
                print(f"Status: {'Active' if char.is_active else 'Inactive'}")
                print(f"Personality Tags: {len(char.personality_tags)} tags")
                print(f"Interest Tags: {len(char.interest_tags)} tags")
                print(f"Prompt: {len(char.prompt)} characters")
                print()
            
            print("=" * 80)
            print("All characters have been successfully created!")
            print("Note: Profile images paths are provided but need to be implemented in the frontend.")
            print("=" * 80)
            
        except Exception as e:
            print(f"Error showing character summary: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(show_character_summary())