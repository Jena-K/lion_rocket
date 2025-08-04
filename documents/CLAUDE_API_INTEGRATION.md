# Claude API 통합 및 채팅 기록 관리

## Claude API 통합 개요

이 문서는 Claude API를 활용한 AI 채팅 기능과 사용자별 채팅 기록 관리 방법을 설명합니다.

## 1. Claude API 설정

### 환경변수 설정
```env
CLAUDE_API_KEY=your_anthropic_api_key_here
CLAUDE_MODEL=claude-3-opus-20240229  # 또는 claude-3-sonnet-20240229
CLAUDE_MAX_TOKENS=1000
CLAUDE_TEMPERATURE=0.7
```

### Claude API 서비스 구현
```python
# backend/app/services/claude_service.py
import anthropic
from typing import List, Dict, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class ClaudeService:
    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY")
        if not self.api_key:
            raise ValueError("CLAUDE_API_KEY not found in environment")
        
        self.client = anthropic.Anthropic(
            api_key=self.api_key,
            max_retries=3,
            timeout=30.0
        )
        self.model = os.getenv("CLAUDE_MODEL", "claude-3-opus-20240229")
        self.max_tokens = int(os.getenv("CLAUDE_MAX_TOKENS", "1000"))
        self.temperature = float(os.getenv("CLAUDE_TEMPERATURE", "0.7"))
    
    async def generate_response(
        self, 
        user_message: str,
        character_prompt: str,
        common_prompts: List[str],
        conversation_history: List[Dict[str, str]]
    ) -> Dict[str, any]:
        """
        Claude API를 통해 응답을 생성합니다.
        
        Args:
            user_message: 사용자의 메시지 (200자 제한)
            character_prompt: 캐릭터의 시스템 프롬프트
            common_prompts: 공용 프롬프트 목록
            conversation_history: 이전 대화 기록
        
        Returns:
            {
                "content": "AI 응답 내용",
                "token_count": 123,
                "model": "claude-3-sonnet-20240229"
            }
        """
        try:
            # 시스템 프롬프트 구성
            system_prompt = self._build_system_prompt(character_prompt, common_prompts)
            
            # 대화 히스토리 구성
            messages = self._build_message_history(conversation_history)
            
            # 현재 사용자 메시지 추가
            messages.append({
                "role": "user",
                "content": user_message[:200]  # 200자 제한
            })
            
            # Claude API 호출
            logger.info(f"Calling Claude API with {len(messages)} messages")
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                system=system_prompt,
                messages=messages
            )
            
            # 응답 처리
            result = {
                "content": response.content[0].text,
                "token_count": response.usage.total_tokens,
                "model": response.model,
                "created_at": datetime.utcnow()
            }
            
            logger.info(f"Claude API response received. Tokens used: {result['token_count']}")
            return result
            
        except anthropic.RateLimitError as e:
            logger.error(f"Claude API rate limit exceeded: {str(e)}")
            raise HTTPException(status_code=429, detail="API rate limit exceeded. Please try again later.")
            
        except anthropic.APIError as e:
            logger.error(f"Claude API error: {str(e)}")
            raise HTTPException(status_code=500, detail="AI service temporarily unavailable")
            
        except Exception as e:
            logger.error(f"Unexpected error in Claude service: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def _build_system_prompt(self, character_prompt: str, common_prompts: List[str]) -> str:
        """시스템 프롬프트를 구성합니다."""
        prompt_parts = [character_prompt]
        prompt_parts.extend(common_prompts)
        
        # 추가 시스템 규칙
        prompt_parts.append("중요: 사용자의 메시지는 최대 200자로 제한되어 있으니, 이를 고려하여 대화하세요.")
        
        return "\n\n".join(prompt_parts)
    
    def _build_message_history(self, conversation_history: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """대화 히스토리를 Claude API 형식으로 변환합니다."""
        # 최근 20개의 메시지만 포함 (컨텍스트 윈도우 관리)
        recent_history = conversation_history[-20:] if len(conversation_history) > 20 else conversation_history
        
        messages = []
        for msg in recent_history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        return messages
```

## 2. 채팅 기록 관리

### 채팅 세션 관리
```python
# backend/app/services/chat_service.py
from sqlalchemy.orm import Session
from app.models import Chat, Message, Character, CommonPrompt
from app.services.claude_service import ClaudeService
from typing import List, Optional

class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.claude_service = ClaudeService()
    
    async def get_or_create_chat(self, user_id: int, character_id: int) -> Chat:
        """
        사용자와 캐릭터 간의 채팅 세션을 가져오거나 생성합니다.
        """
        # 기존 채팅 세션 확인
        chat = self.db.query(Chat).filter(
            Chat.user_id == user_id,
            Chat.character_id == character_id
        ).first()
        
        if not chat:
            # 새 채팅 세션 생성
            chat = Chat(
                user_id=user_id,
                character_id=character_id
            )
            self.db.add(chat)
            self.db.commit()
            self.db.refresh(chat)
        
        return chat
    
    async def send_message(self, chat_id: int, user_id: int, content: str) -> dict:
        """
        메시지를 전송하고 AI 응답을 받습니다.
        """
        # 채팅 세션 확인
        chat = self.db.query(Chat).filter(
            Chat.id == chat_id,
            Chat.user_id == user_id  # 권한 확인
        ).first()
        
        if not chat:
            raise ValueError("Chat session not found")
        
        # 캐릭터 정보 가져오기
        character = self.db.query(Character).filter(
            Character.id == chat.character_id
        ).first()
        
        # 공용 프롬프트 가져오기
        common_prompts = self.db.query(CommonPrompt).all()
        prompt_texts = [p.prompt_text for p in common_prompts]
        
        # 이전 대화 기록 가져오기
        conversation_history = self._get_conversation_history(chat_id)
        
        # 사용자 메시지 저장
        user_message = Message(
            chat_id=chat_id,
            role="user",
            content=content[:200],  # 200자 제한
            token_count=0  # 사용자 메시지는 토큰 카운트 불필요
        )
        self.db.add(user_message)
        self.db.commit()
        
        # Claude API 호출
        ai_response = await self.claude_service.generate_response(
            user_message=content,
            character_prompt=character.system_prompt,
            common_prompts=prompt_texts,
            conversation_history=conversation_history
        )
        
        # AI 응답 저장
        assistant_message = Message(
            chat_id=chat_id,
            role="assistant",
            content=ai_response["content"],
            token_count=ai_response["token_count"]
        )
        self.db.add(assistant_message)
        
        # 채팅 마지막 메시지 시간 업데이트
        chat.last_message_at = datetime.utcnow()
        
        # 사용량 통계 업데이트
        self._update_usage_stats(user_id, ai_response["token_count"])
        
        self.db.commit()
        
        return {
            "user_message": {
                "id": user_message.id,
                "role": user_message.role,
                "content": user_message.content,
                "created_at": user_message.created_at
            },
            "assistant_message": {
                "id": assistant_message.id,
                "role": assistant_message.role,
                "content": assistant_message.content,
                "token_count": assistant_message.token_count,
                "created_at": assistant_message.created_at
            }
        }
    
    def _get_conversation_history(self, chat_id: int) -> List[Dict[str, str]]:
        """
        채팅 기록을 가져옵니다.
        """
        messages = self.db.query(Message).filter(
            Message.chat_id == chat_id
        ).order_by(Message.created_at).all()
        
        history = []
        for msg in messages:
            history.append({
                "role": msg.role,
                "content": msg.content
            })
        
        return history
    
    def _update_usage_stats(self, user_id: int, token_count: int):
        """
        사용량 통계를 업데이트합니다.
        """
        from app.models import UsageStats
        from datetime import date
        
        today = date.today()
        
        # 오늘의 통계 가져오기 또는 생성
        stats = self.db.query(UsageStats).filter(
            UsageStats.user_id == user_id,
            UsageStats.usage_date == today
        ).first()
        
        if not stats:
            stats = UsageStats(
                user_id=user_id,
                usage_date=today,
                chat_count=0,
                total_tokens=0
            )
            self.db.add(stats)
        
        stats.chat_count += 1
        stats.total_tokens += token_count
```

## 3. API 엔드포인트 구현

### 채팅 관련 엔드포인트
```python
# backend/app/api/endpoints/chat.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.chat_service import ChatService
from app.schemas.chat import MessageCreate, MessageResponse
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.post("/api/chats/{chat_id}/messages", response_model=MessageResponse)
async def send_message(
    chat_id: int,
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Claude API를 통해 메시지를 전송하고 응답을 받습니다.
    채팅 기록은 자동으로 저장되며, 로그아웃 후에도 유지됩니다.
    """
    chat_service = ChatService(db)
    
    try:
        result = await chat_service.send_message(
            chat_id=chat_id,
            user_id=current_user.id,
            content=message.content
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message")

@router.get("/api/chats")
async def get_user_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 20
):
    """
    현재 사용자의 모든 채팅 세션을 가져옵니다.
    로그아웃 후 재로그인해도 모든 채팅 기록이 유지됩니다.
    """
    offset = (page - 1) * limit
    
    chats = db.query(Chat).filter(
        Chat.user_id == current_user.id
    ).order_by(Chat.last_message_at.desc()).offset(offset).limit(limit).all()
    
    total = db.query(Chat).filter(Chat.user_id == current_user.id).count()
    
    return {
        "items": [
            {
                "id": chat.id,
                "character": {
                    "id": chat.character.id,
                    "name": chat.character.name
                },
                "last_message": chat.messages[-1].content if chat.messages else None,
                "last_message_at": chat.last_message_at,
                "created_at": chat.created_at
            }
            for chat in chats
        ],
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/api/chats/{chat_id}")
async def get_chat_detail(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 채팅의 전체 대화 기록을 가져옵니다.
    """
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(Message.created_at).all()
    
    return {
        "id": chat.id,
        "user_id": chat.user_id,
        "character": {
            "id": chat.character.id,
            "name": chat.character.name,
            "system_prompt": chat.character.system_prompt
        },
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "token_count": msg.token_count if msg.role == "assistant" else None,
                "created_at": msg.created_at
            }
            for msg in messages
        ],
        "created_at": chat.created_at
    }
```

## 4. Frontend 채팅 기록 관리

### Pinia Store에서 채팅 상태 관리
```typescript
// frontend/src/stores/chatStore.ts
export const useChatStore = defineStore('chat', {
  state: () => ({
    chats: [] as Chat[],
    currentChatId: null as number | null,
    messages: {} as Record<number, Message[]>,
    characters: [] as Character[],
    isLoading: false,
    isLoadingHistory: false
  }),
  
  actions: {
    async loadUserChats() {
      /**
       * 사용자의 모든 채팅 세션을 로드합니다.
       * 로그인 시 자동으로 호출되어 이전 채팅 기록을 복원합니다.
       */
      try {
        const response = await chatApi.getChats()
        this.chats = response.data.items
        
        // 가장 최근 채팅을 자동으로 선택
        if (this.chats.length > 0 && !this.currentChatId) {
          this.currentChatId = this.chats[0].id
          await this.loadChatMessages(this.chats[0].id)
        }
      } catch (error) {
        console.error('Failed to load chats:', error)
      }
    },
    
    async loadChatMessages(chatId: number) {
      /**
       * 특정 채팅의 전체 메시지 기록을 로드합니다.
       */
      this.isLoadingHistory = true
      try {
        const response = await chatApi.getChatDetail(chatId)
        this.messages[chatId] = response.data.messages
      } finally {
        this.isLoadingHistory = false
      }
    },
    
    async sendMessage(chatId: number, content: string) {
      /**
       * Claude API를 통해 메시지를 전송합니다.
       */
      this.isLoading = true
      try {
        const response = await chatApi.sendMessage(chatId, { content })
        
        // 메시지 목록에 추가
        if (!this.messages[chatId]) {
          this.messages[chatId] = []
        }
        
        this.messages[chatId].push(
          response.data.user_message,
          response.data.assistant_message
        )
        
        // 채팅 목록의 마지막 메시지 업데이트
        const chat = this.chats.find(c => c.id === chatId)
        if (chat) {
          chat.last_message = response.data.assistant_message.content
          chat.last_message_at = response.data.assistant_message.created_at
        }
        
      } finally {
        this.isLoading = false
      }
    },
    
    async createNewChat(characterId: number) {
      /**
       * 새로운 채팅 세션을 생성합니다.
       */
      const response = await chatApi.createChat({ character_id: characterId })
      await this.loadUserChats()
      this.currentChatId = response.data.id
      this.messages[response.data.id] = []
      return response.data.id
    }
  },
  
  persist: {
    // 로컬 스토리지에 현재 채팅 ID 저장 (빠른 복원을 위해)
    paths: ['currentChatId']
  }
})
```

### 로그인 시 채팅 기록 복원
```typescript
// frontend/src/views/LoginView.vue
async function handleLogin() {
  try {
    await authStore.login(credentials)
    
    // 로그인 성공 후 채팅 기록 로드
    await chatStore.loadUserChats()
    await chatStore.loadCharacters()
    
    // 메인 채팅 화면으로 이동
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  }
}
```

## 5. 채팅 기록 영구 보존

### 데이터베이스 설계
- `chats` 테이블: 사용자별 채팅 세션 관리
- `messages` 테이블: 모든 대화 내용 저장
- 인덱스: `user_id`, `chat_id`로 빠른 조회

### 채팅 기록 특징
1. **영구 보존**: 사용자가 명시적으로 삭제하지 않는 한 모든 채팅 기록 유지
2. **세션 독립성**: 로그아웃/로그인과 무관하게 채팅 기록 보존
3. **캐릭터별 관리**: 각 캐릭터와의 대화를 별도 세션으로 관리
4. **컨텍스트 유지**: Claude API 호출 시 이전 대화 내용을 컨텍스트로 제공

## 6. 성능 최적화

### 채팅 기록 캐싱
```python
# backend/app/services/cache_service.py
from functools import lru_cache
import redis
import json

class ChatCacheService:
    def __init__(self):
        self.redis_client = redis.Redis(
            host='localhost',
            port=6379,
            decode_responses=True
        )
    
    def cache_conversation_history(self, chat_id: int, history: List[Dict]):
        """최근 대화 기록을 캐시합니다."""
        key = f"chat_history:{chat_id}"
        self.redis_client.setex(
            key,
            3600,  # 1시간 TTL
            json.dumps(history)
        )
    
    def get_cached_history(self, chat_id: int) -> Optional[List[Dict]]:
        """캐시된 대화 기록을 가져옵니다."""
        key = f"chat_history:{chat_id}"
        data = self.redis_client.get(key)
        return json.loads(data) if data else None
```

### Frontend 최적화
- 가상 스크롤링으로 긴 대화 내용 효율적 렌더링
- 메시지 페이지네이션
- 로컬 스토리지 활용한 임시 캐싱

## 7. 모니터링 및 로깅

### Claude API 사용량 추적
```python
# 일별 사용량 통계
- 사용자별 채팅 횟수
- 사용자별 토큰 사용량
- 캐릭터별 인기도
- API 응답 시간
```

### 에러 처리
- Claude API 오류 시 사용자 친화적 메시지 표시
- Rate limit 초과 시 대기 시간 안내
- 네트워크 오류 시 재시도 메커니즘