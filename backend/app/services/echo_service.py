from typing import List, Tuple
from app.models import Message, Character


class EchoService:
    """Service for echo functionality - returns the user's message as-is"""

    def __init__(self):
        pass

    async def generate_response(
        self, messages: List[Message], character: Character, user_message: str
    ) -> Tuple[str, int, int]:
        """
        Generate an echo response - simply return the user's message
        
        Returns:
            tuple: (response_text, input_tokens, output_tokens)
        """
        # Echo the user's message
        response_text = user_message
        
        # Simple token estimation (~4 characters per token)
        input_tokens = len(user_message) // 4
        output_tokens = len(response_text) // 4
        
        return response_text, input_tokens, output_tokens

    async def validate_api_key(self) -> bool:
        """Echo service doesn't need API key validation"""
        return True


# Singleton instance
echo_service = EchoService()