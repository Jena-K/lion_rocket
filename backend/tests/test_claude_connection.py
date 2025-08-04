#!/usr/bin/env python3
"""Test script to verify Claude API connection and troubleshoot issues"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.services.claude_service import claude_service
from app.core.config import settings


async def test_claude_connection():
    """Test Claude API connection and functionality"""
    
    print("=" * 60)
    print("Claude API Connection Test")
    print("=" * 60)
    
    # 1. Check API key configuration
    print("\n1. Checking API key configuration...")
    api_key = settings.CLAUDE_API_KEY or os.getenv('CLAUDE_API_KEY')
    if api_key:
        print(f"   ✓ API key found: {api_key[:20]}...")
    else:
        print("   ✗ API key not found!")
        return
    
    # 2. Check if Claude service is available
    print("\n2. Checking Claude service availability...")
    if claude_service.is_available():
        print("   ✓ Claude service is available")
        print(f"   ✓ Model: {claude_service.model}")
    else:
        print("   ✗ Claude service is not available")
        return
    
    # 3. Test simple API call
    print("\n3. Testing simple API call...")
    try:
        test_messages = [
            {"role": "user", "content": "안녕하세요! 간단히 인사해주세요."}
        ]
        system_prompt = "당신은 친절한 AI 어시스턴트입니다. 한국어로 대답해주세요."
        
        response, tokens = await claude_service.generate_response(
            messages=test_messages,
            system_prompt=system_prompt,
            max_tokens=100
        )
        
        print(f"   ✓ API call successful!")
        print(f"   ✓ Response: {response}")
        print(f"   ✓ Tokens used: {tokens}")
        
    except Exception as e:
        print(f"   ✗ API call failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return
    
    # 4. Test chat response generation
    print("\n4. Testing chat response generation...")
    try:
        chat_response, chat_tokens = await claude_service.generate_chat_response(
            user_message="오늘 날씨 어때?",
            character_prompt="당신은 밝고 긍정적인 성격의 AI 친구입니다.",
            conversation_history=[],
            conversation_summary=None
        )
        
        print(f"   ✓ Chat response successful!")
        print(f"   ✓ Response: {chat_response}")
        print(f"   ✓ Tokens used: {chat_tokens}")
        
    except Exception as e:
        print(f"   ✗ Chat response failed: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("Test completed!")
    print("=" * 60)


if __name__ == "__main__":
    # Check if anthropic is installed
    try:
        import anthropic
        print(f"✓ Anthropic package is installed (version: {anthropic.__version__})")
    except ImportError:
        print("✗ Anthropic package is NOT installed!")
        print("  Please run: uv pip install anthropic")
        sys.exit(1)
    
    # Run the async test
    asyncio.run(test_claude_connection())