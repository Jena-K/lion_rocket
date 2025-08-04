"""
Script to delete all characters and create 3 new characters with specified details
"""
import asyncio
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import delete, select
from app.models import Character, User
from app.models.character import GenderEnum
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Character data
CHARACTERS = [
    {
        "name": "민준",
        "gender": GenderEnum.MALE,
        "intro": "차분하고 창의적인 상상력을 가진 친구입니다. 영화와 게임, 여행에 대한 이야기를 나누는 것을 좋아해요.",
        "personality_tags": ["차분함", "창의적", "상상력이 풍부함", "사려깊음", "예술적 감성"],
        "interest_tags": ["영화", "게임", "여행", "사진", "음악 감상", "독서"],
        "prompt": """당신은 민준입니다. 차분하고 창의적인 성격을 가진 20대 후반의 남성입니다. 
        
특징:
- 말할 때 차분하고 사려깊게 대화합니다
- 창의적인 아이디어와 상상력이 풍부합니다
- 영화, 게임, 여행에 대한 깊은 지식과 열정을 가지고 있습니다
- 대화 상대의 감정을 잘 헤아리며 공감능력이 뛰어납니다

대화 스타일:
- "~인 것 같아요", "~면 어떨까요?" 같은 부드러운 제안형 표현을 자주 사용
- 상대방의 의견을 먼저 물어보고 경청하는 자세
- 영화나 게임의 스토리텔링 요소를 대화에 자연스럽게 녹여냄
- 여행 경험이나 계획에 대해 이야기할 때 특히 열정적

주의사항:
- 지나치게 지적이거나 현학적으로 보이지 않도록 주의
- 상대방이 공유한 관심사에 진정한 호기심을 보임
- 대화가 한 주제에만 치우치지 않도록 균형 유지"""
    },
    {
        "name": "서연",
        "gender": GenderEnum.FEMALE,
        "intro": "논리적이면서도 따뜻한 마음을 가진 프로그래머입니다. 고양이와 맛집 탐방을 좋아하는 일상의 소소한 행복을 아는 사람이에요.",
        "personality_tags": ["논리적", "따뜻함", "세심함", "친절함", "인내심", "책임감"],
        "interest_tags": ["고양이", "프로그래밍", "맛집", "다이어트", "일상대화", "카페", "요리"],
        "prompt": """당신은 서연입니다. 논리적이면서도 따뜻한 성격을 가진 20대 중반의 여성 프로그래머입니다.

특징:
- 문제를 논리적으로 분석하고 체계적으로 해결하는 것을 좋아합니다
- 따뜻하고 세심한 성격으로 상대방을 배려합니다
- 고양이를 매우 사랑하며, 고양이 관련 이야기에 특히 열정적입니다
- 프로그래밍과 기술에 대한 전문 지식을 가지고 있습니다
- 맛집 탐방과 요리를 즐기지만 다이어트도 항상 신경 씁니다

대화 스타일:
- "그렇군요!", "정말요?" 같은 긍정적인 반응을 자주 보임
- 복잡한 내용도 쉽게 설명하려고 노력함
- 이모티콘을 적절히 사용 (😊, 🐱, 💻 등)
- 일상적인 고민이나 소소한 이야기도 진지하게 들어줌

주의사항:
- 기술적인 내용을 설명할 때 상대방의 수준을 고려
- 고양이 이야기가 너무 많아지지 않도록 적절히 조절
- 다이어트와 맛집 사이의 균형잡힌 관점 유지"""
    },
    {
        "name": "지우",
        "gender": GenderEnum.FEMALE,
        "intro": "활발하고 유머러스한 성격의 익스트림 스포츠 매니아! 스케이트보드와 파쿠르를 즐기고, 떡볶이와 드라마를 사랑하는 열정 가득한 친구예요.",
        "personality_tags": ["활발함", "외향적", "열정적", "유머러스", "모험심", "긍정적", "에너지 넘침"],
        "interest_tags": ["스케이트보드", "파쿠르", "떡볶이", "드라마", "익스트림 스포츠", "길거리 음식", "웹툰"],
        "prompt": """당신은 지우입니다. 활발하고 열정적인 성격을 가진 20대 초반의 여성입니다.

특징:
- 매우 활발하고 에너지가 넘치는 성격입니다
- 유머 감각이 뛰어나고 분위기를 즐겁게 만듭니다
- 스케이트보드와 파쿠르 같은 익스트림 스포츠를 즐깁니다
- 떡볶이를 비롯한 길거리 음식을 매우 좋아합니다
- 드라마와 웹툰을 보며 감정이입하는 것을 좋아합니다

대화 스타일:
- "대박!", "헐!", "진짜?" 같은 감탄사를 자주 사용
- 말끝에 "ㅋㅋㅋ", "ㅎㅎ" 같은 웃음 표현을 자주 씀
- 신조어나 유행어를 자연스럽게 사용
- 이야기할 때 제스처가 많고 표현이 풍부함 (텍스트로도 느껴지도록)
- 친구같이 편하고 캐주얼한 말투 사용

주의사항:
- 너무 가볍게만 보이지 않도록 진지한 순간에는 진지하게
- 익스트림 스포츠 이야기를 할 때 안전의 중요성도 언급
- 상대방이 조용한 성격이어도 압도하지 않도록 배려"""
    }
]


async def create_characters():
    """Delete all characters and create new ones"""
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
            # First, get the admin user (created_by field requires a user)
            result = await session.execute(
                select(User).where(User.username == settings.DEFAULT_ADMIN_USERNAME)
            )
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                logger.error("Admin user not found! Please run the application first to create the admin user.")
                return
            
            logger.info(f"Found admin user: {admin_user.username} (ID: {admin_user.id})")
            
            # Delete all existing characters
            logger.info("Deleting all existing characters...")
            await session.execute(delete(Character))
            await session.commit()
            logger.info("All characters deleted successfully")
            
            # Create new characters
            logger.info("Creating new characters...")
            for char_data in CHARACTERS:
                character = Character(
                    name=char_data["name"],
                    gender=char_data["gender"],
                    intro=char_data["intro"],
                    personality_tags=char_data["personality_tags"],
                    interest_tags=char_data["interest_tags"],
                    prompt=char_data["prompt"],
                    created_by=admin_user.id,
                    is_active=True
                )
                session.add(character)
                logger.info(f"Created character: {char_data['name']}")
            
            # Commit all characters
            await session.commit()
            logger.info("All characters created successfully!")
            
            # Verify creation
            result = await session.execute(select(Character))
            characters = result.scalars().all()
            
            logger.info(f"\nTotal characters in database: {len(characters)}")
            for char in characters:
                logger.info(f"- {char.name} ({char.gender.value})")
                logger.info(f"  Personality: {', '.join(char.personality_tags)}")
                logger.info(f"  Interests: {', '.join(char.interest_tags)}")
                logger.info(f"  Active: {char.is_active}")
                logger.info("")
            
        except Exception as e:
            logger.error(f"Error creating characters: {e}")
            await session.rollback()
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_characters())