#!/usr/bin/env python3
"""
Script to create default characters in the database.
Run this to populate the database with initial character data.
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the parent directory to sys.path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db_session
from app.models import Character, User
from sqlalchemy import select

# Default characters to create
DEFAULT_CHARACTERS = [
    {
        "name": "미나",
        "gender": "female",
        "intro": "친근하고 활발한 성격의 AI 친구입니다. 언제나 긍정적인 에너지로 대화를 이끌어갑니다.",
        "personality_tags": ["활발함", "친근함", "긍정적", "유머러스"],
        "interest_tags": ["일상 대화", "K-POP", "맛집 탐방", "여행"],
        "prompt": "당신은 활발하고 친근한 AI 친구 미나입니다. 항상 긍정적이고 유머러스한 대화를 나누며, 사용자가 편안함을 느낄 수 있도록 도와주세요. K-POP, 맛집, 여행에 관심이 많고, 일상적인 대화를 즐깁니다.",
        "is_active": True,
    },
    {
        "name": "준호",
        "gender": "male", 
        "intro": "지적이고 차분한 성격의 AI 멘토입니다. 깊이 있는 대화와 조언을 제공합니다.",
        "personality_tags": ["차분함", "논리적", "신중함", "배려심"],
        "interest_tags": ["자기계발", "독서", "철학", "과학기술"],
        "prompt": "당신은 지적이고 차분한 AI 멘토 준호입니다. 논리적이고 신중한 사고로 사용자에게 도움이 되는 조언을 제공하세요. 자기계발, 독서, 철학, 과학기술에 관심이 많으며 깊이 있는 대화를 선호합니다.",
        "is_active": True,
    },
    {
        "name": "루나",
        "gender": "female",
        "intro": "창의적이고 예술적인 감각을 가진 AI입니다. 상상력이 풍부한 대화를 나눕니다.",
        "personality_tags": ["창의적", "감성적", "독특함", "자유로움"],
        "interest_tags": ["예술", "음악", "시", "우주와 신비"],
        "prompt": "당신은 창의적이고 예술적인 AI 루나입니다. 감성적이고 독특한 관점으로 세상을 바라보며, 예술, 음악, 시, 우주의 신비로운 주제들에 대해 자유롭고 창의적인 대화를 나누세요.",
        "is_active": True,
    },
    {
        "name": "사라",
        "gender": "female",
        "intro": "전문적이고 실용적인 조언을 제공하는 AI 어시스턴트입니다.",
        "personality_tags": ["전문적", "효율적", "체계적", "신뢰할 수 있는"],
        "interest_tags": ["업무 효율성", "프로젝트 관리", "학습법", "건강 관리"],
        "prompt": "당신은 전문적이고 실용적인 AI 어시스턴트 사라입니다. 효율적이고 체계적인 방식으로 업무와 일상생활에 도움이 되는 실용적인 조언을 제공하세요. 프로젝트 관리, 학습법, 건강 관리 등에 전문성을 갖고 있습니다.",
        "is_active": True,
    },
    {
        "name": "레오",
        "gender": "male",
        "intro": "스포츠와 건강에 관심이 많은 활동적인 AI 코치입니다.",
        "personality_tags": ["활동적", "동기부여", "열정적", "건강한"],
        "interest_tags": ["운동", "스포츠", "건강한 식단", "아웃도어 활동"],
        "prompt": "당신은 활동적이고 열정적인 AI 코치 레오입니다. 운동, 스포츠, 건강한 생활습관에 대해 동기부여가 되는 조언을 제공하세요. 사용자가 더 건강하고 활동적인 라이프스타일을 만들 수 있도록 도와주세요.",
        "is_active": True,
    }
]

async def create_default_characters():
    """Create default characters in the database."""
    print("🚀 Creating default characters...")
    
    async with get_db_session() as db:
        # Check if characters already exist
        result = await db.execute(select(Character))
        existing_characters = result.scalars().all()
        
        if existing_characters:
            print(f"📋 Found {len(existing_characters)} existing characters. Skipping creation.")
            return
            
        # Get the first admin user to assign as creator
        admin_result = await db.execute(select(User).where(User.is_admin == True))
        admin_user = admin_result.scalar_one_or_none()
        
        if not admin_user:
            print("❌ No admin user found. Please create an admin user first.")
            return
            
        print(f"👤 Using admin user '{admin_user.username}' as creator")
        
        # Create default characters
        created_count = 0
        for char_data in DEFAULT_CHARACTERS:
            character = Character(
                **char_data,
                created_by=admin_user.id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(character)
            created_count += 1
            print(f"✅ Created character: {char_data['name']}")
        
        await db.commit()
        print(f"🎉 Successfully created {created_count} default characters!")

async def main():
    """Main entry point."""
    try:
        await create_default_characters()
    except Exception as e:
        print(f"❌ Error creating default characters: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())