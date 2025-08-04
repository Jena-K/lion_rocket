#!/usr/bin/env python3
"""
Simple test script to verify Claude AI integration is working.
Run this from the backend directory: python test_claude_integration.py
"""

import os
import asyncio
from anthropic import Anthropic

async def test_claude_integration():
    """Test Claude AI API integration"""
    print("🧪 Testing Claude AI Integration...")
    
    # Check environment variables
    api_key = os.getenv("CLAUDE_API_KEY")
    if not api_key:
        print("❌ CLAUDE_API_KEY environment variable not set")
        return False
    
    model = os.getenv("CLAUDE_MODEL", "claude-3-sonnet-20240229")
    max_tokens = int(os.getenv("CLAUDE_MAX_TOKENS", "1000"))
    temperature = float(os.getenv("CLAUDE_TEMPERATURE", "0.7"))
    
    print(f"✅ Environment variables:")
    print(f"   Model: {model}")
    print(f"   Max Tokens: {max_tokens}")
    print(f"   Temperature: {temperature}")
    
    # Test Claude API connection
    try:
        client = Anthropic(api_key=api_key)
        
        # Test message with character prompt
        character_prompt = "당신은 친근하고 도움이 되는 AI 어시스턴트입니다. 한국어로 대화하며, 사용자의 질문에 정중하고 상세하게 답변해주세요."
        
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=character_prompt,
            messages=[
                {"role": "user", "content": "안녕하세요! 테스트 메시지입니다."}
            ]
        )
        
        print(f"✅ Claude API connection successful!")
        print(f"   Response: {response.content[0].text[:100]}...")
        print(f"   Tokens used: {response.usage.input_tokens + response.usage.output_tokens}")
        
        return True
        
    except Exception as e:
        print(f"❌ Claude API connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_claude_integration())
    if success:
        print("\n🎉 Claude AI integration test passed!")
    else:
        print("\n💥 Claude AI integration test failed!")