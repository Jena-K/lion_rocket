"""
Claude API service for AI chat functionality
"""
import os
import asyncio
from typing import List, Dict, Optional, Tuple
from anthropic import AsyncAnthropic
from app.core.config import settings


class ClaudeService:
    """Service for integrating with Claude API"""
    
    def __init__(self):
        # Initialize Claude client
        api_key = getattr(settings, 'CLAUDE_API_KEY', None) or os.getenv('CLAUDE_API_KEY')
        
        if api_key:
            try:
                self.client = AsyncAnthropic(api_key=api_key)
                self.model = "claude-3-haiku-20240307"  # Claude 3 Haiku model
                self.max_tokens = 1000
                self.api_available = True
                print(f"[OK] Claude API service initialized successfully with key: {api_key[:20]}...")
                print(f"[OK] Using model: {self.model}")
            except Exception as e:
                print(f"[ERROR] Failed to initialize Claude API client: {str(e)}")
                self.client = None
                self.api_available = False
        else:
            self.client = None
            self.api_available = False
            print("[WARNING] Claude API key not found. All responses will be fallback messages.")
    
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        max_tokens: Optional[int] = None
    ) -> Tuple[str, int]:
        """
        Generate response using Claude API or fallback
        
        Args:
            messages: List of conversation messages [{"role": "user|assistant", "content": str}]
            system_prompt: System prompt with character personality
            max_tokens: Maximum tokens to generate (default: 1000)
            
        Returns:
            Tuple of (response_content, token_usage)
        """
        # If API is not available, return fallback response
        if not self.api_available:
            return await self._generate_fallback_response(messages)
        
        try:
            max_tokens = max_tokens or self.max_tokens
            
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                system=system_prompt,
                messages=messages
            )
            
            # Extract response content
            content = ""
            if response.content and len(response.content) > 0:
                content = response.content[0].text
            
            # Calculate token usage
            token_usage = response.usage.input_tokens + response.usage.output_tokens
            
            return content, token_usage
            
        except Exception as e:
            print(f"[ERROR] Claude API error: {type(e).__name__}: {str(e)}")
            # Log more details for debugging
            if hasattr(e, 'response'):
                print(f"[ERROR] Response status: {getattr(e.response, 'status_code', 'N/A')}")
                print(f"[ERROR] Response body: {getattr(e.response, 'text', 'N/A')}")
            # Return fallback response with estimated token usage
            return await self._generate_fallback_response(messages)
    
    async def _generate_fallback_response(self, messages: List[Dict[str, str]]) -> Tuple[str, int]:
        """Generate a simple fallback response when Claude API is not available"""
        # Simple, honest fallback without mock conversational responses
        fallback_message = "죄송합니다. 현재 AI 서비스에 일시적인 문제가 있어 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요."
        estimated_tokens = 50  # Fixed estimate for this standard message
        
        return fallback_message, estimated_tokens
    
    async def generate_chat_response(
        self,
        user_message: str,
        character_prompt: str,
        conversation_history: List[Dict[str, str]] = None,
        conversation_summary: Optional[str] = None
    ) -> Tuple[str, int]:
        """
        Generate chat response with character context
        
        Args:
            user_message: Current user message
            character_prompt: Character's personality prompt
            conversation_history: Previous conversation messages
            conversation_summary: Summary of previous conversations
            
        Returns:
            Tuple of (response_content, token_usage)
        """
        # Prepare system prompt
        system_prompt = character_prompt
        
        if conversation_summary:
            system_prompt += f"\n\n[이전 대화 요약]\n{conversation_summary}\n\n위 요약을 참고하여 일관성 있는 대화를 이어가주세요."
        
        # Prepare messages
        messages = conversation_history or []
        messages.append({"role": "user", "content": user_message})
        
        return await self.generate_response(
            messages=messages,
            system_prompt=system_prompt
        )
    
    def is_available(self) -> bool:
        """Check if Claude API is available"""
        return self.api_available


# Create singleton instance
claude_service = ClaudeService()