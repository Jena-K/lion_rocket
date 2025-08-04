import os
import logging
from typing import List, Dict, Optional, Tuple
from anthropic import Anthropic, APIError, APIConnectionError, RateLimitError
from app.models import Message, Character
from app.schemas.chat import MessageRole

logger = logging.getLogger(__name__)


class ClaudeService:
    """Service for interacting with Claude API"""

    def __init__(self):
        self.api_key = os.getenv("CLAUDE_API_KEY")
        if not self.api_key:
            raise ValueError("CLAUDE_API_KEY environment variable not set")

        self.client = Anthropic(api_key=self.api_key)
        self.model = os.getenv("CLAUDE_MODEL", "claude-3-sonnet-20240229")
        self.max_tokens = int(os.getenv("CLAUDE_MAX_TOKENS", "1000"))
        self.temperature = float(os.getenv("CLAUDE_TEMPERATURE", "0.7"))

    def prepare_messages(
        self, messages: List[Message], character: Character
    ) -> List[Dict[str, str]]:
        """Prepare messages for Claude API with character system prompt"""
        formatted_messages = []

        # Add system prompt from character
        if character.prompt:
            formatted_messages.append({"role": "system", "content": character.prompt})

        # Add conversation history
        for msg in messages:
            # Claude API uses "user" and "assistant" roles
            role = msg.role if msg.role in ["user", "assistant"] else "user"
            formatted_messages.append({"role": role, "content": msg.content})

        return formatted_messages

    def count_tokens(self, text: str) -> int:
        """Estimate token count for a text string"""
        # Simple estimation: ~4 characters per token
        # For production, use tiktoken or Claude's token counting API
        return len(text) // 4

    async def generate_response(
        self, 
        messages: List[Message], 
        character: Character, 
        user_message: str,
        conversation_summary: Optional[str] = None
    ) -> Tuple[str, int, int]:
        """
        Generate a response from Claude with optional conversation context

        Returns:
            tuple: (response_text, input_tokens, output_tokens)
        """
        try:
            # Prepare messages for API
            formatted_messages = self.prepare_messages(messages, character)

            # Add the new user message
            formatted_messages.append({"role": "user", "content": user_message})
            
            # Prepare system prompt with conversation context if available
            system_prompt = character.prompt
            if conversation_summary:
                system_prompt = f"{character.prompt}\n\n[이전 대화 요약]\n{conversation_summary}\n\n위 요약을 참고하여 일관성 있는 대화를 이어가주세요."

            # Count input tokens
            input_text = system_prompt + " ".join(
                [m["content"] for m in formatted_messages]
            )
            input_tokens = self.count_tokens(input_text)

            # Call Claude API
            response = self.client.messages.create(
                model=self.model,
                messages=formatted_messages[1:],  # Skip system message for messages param
                system=system_prompt,  # Use enhanced system prompt with context
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )

            # Extract response text
            response_text = response.content[0].text

            # Count output tokens
            output_tokens = self.count_tokens(response_text)

            # Log successful API call
            logger.info(
                f"Claude API call successful. Tokens: {input_tokens} in, {output_tokens} out"
            )

            return response_text, input_tokens, output_tokens

        except RateLimitError as e:
            logger.error(f"Claude API rate limit exceeded: {e}")
            raise Exception("AI service is currently busy. Please try again later.")

        except APIConnectionError as e:
            logger.error(f"Claude API connection error: {e}")
            raise Exception("Unable to connect to AI service. Please check your connection.")

        except APIError as e:
            logger.error(f"Claude API error: {e}")
            raise Exception(f"AI service error: {str(e)}")

        except Exception as e:
            logger.error(f"Unexpected error in Claude service: {e}")
            raise Exception("An unexpected error occurred. Please try again.")

    async def validate_api_key(self) -> bool:
        """Validate that the API key works"""
        try:
            # Make a minimal API call to test the key
            response = self.client.messages.create(
                model=self.model, messages=[{"role": "user", "content": "Hello"}], max_tokens=10
            )
            return True
        except Exception as e:
            logger.error(f"API key validation failed: {e}")
            return False


# Singleton instance
claude_service = ClaudeService()
