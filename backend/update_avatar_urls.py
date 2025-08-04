#!/usr/bin/env python3
"""
Avatar URL 업데이트 스크립트
모든 캐릭터의 avatar_url을 {character_id}_YYYYMMDDHHMMSS 형식으로 변경
"""

import asyncio
import sys
from datetime import datetime
from pathlib import Path

# 프로젝트 루트를 Python path에 추가
sys.path.append(str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db, engine
from app.models.character import Character

async def update_all_avatar_urls():
    """모든 캐릭터의 avatar_url을 새 형식으로 업데이트"""
    
    # 현재 시각을 YYYYMMDDHHMMSS 형식으로 포맷
    current_time = datetime.now()
    timestamp = current_time.strftime("%Y%m%d%H%M%S")
    
    print(f"🕐 현재 시각: {current_time}")
    print(f"📅 타임스탬프: {timestamp}")
    print(f"🔄 캐릭터 avatar_url 업데이트 시작...")
    
    # 데이터베이스 세션 생성
    async with AsyncSession(engine) as session:
        try:
            # 모든 캐릭터 조회
            result = await session.execute(select(Character))
            characters = result.scalars().all()
            
            if not characters:
                print("❌ 등록된 캐릭터가 없습니다.")
                return
            
            print(f"📊 총 {len(characters)}개 캐릭터 발견")
            
            # 각 캐릭터의 avatar_url 업데이트
            updated_count = 0
            for character in characters:
                old_avatar_url = character.avatar_url
                new_avatar_url = f"{character.character_id}_{timestamp}"
                
                # avatar_url 업데이트
                character.avatar_url = new_avatar_url
                session.add(character)
                
                print(f"✅ ID {character.character_id}: '{old_avatar_url}' → '{new_avatar_url}'")
                updated_count += 1
            
            # 변경사항 커밋
            await session.commit()
            print(f"💾 {updated_count}개 캐릭터 avatar_url 업데이트 완료!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ 오류 발생: {e}")
            raise
        
        finally:
            await session.close()

async def verify_updates():
    """업데이트 결과 확인"""
    print("\n🔍 업데이트 결과 확인...")
    
    async with AsyncSession(engine) as session:
        try:
            result = await session.execute(select(Character))
            characters = result.scalars().all()
            
            print(f"📋 현재 캐릭터 avatar_url 목록:")
            for character in characters:
                print(f"  - ID {character.character_id}: {character.name} → {character.avatar_url}")
                
        except Exception as e:
            print(f"❌ 확인 중 오류: {e}")
        finally:
            await session.close()

async def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("🎭 캐릭터 Avatar URL 업데이트 스크립트")
    print("=" * 60)
    
    try:
        await update_all_avatar_urls()
        await verify_updates()
        print("\n✅ 모든 작업이 성공적으로 완료되었습니다!")
        
    except Exception as e:
        print(f"\n❌ 실행 중 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())