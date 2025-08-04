#!/usr/bin/env python3
"""Simple test for Claude API with common model names"""

import asyncio
from anthropic import AsyncAnthropic
import os

async def test_claude():
    # Get API key from environment or hardcoded (for testing only)
    api_key = os.getenv('CLAUDE_API_KEY', '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')
    
    print(f"API Key: {api_key[:20]}...")
    
    client = AsyncAnthropic(api_key=api_key)
    
    # Try different model formats
    models_to_test = [
        "claude-3-haiku-20240307",
        "claude-3-sonnet-20240229", 
        "claude-2.1",
        "claude-2.0",
        "claude-instant-1.2",
    ]
    
    for model in models_to_test:
        print(f"\nTesting model: {model}")
        try:
            message = await client.messages.create(
                model=model,
                max_tokens=50,
                messages=[
                    {"role": "user", "content": "Reply with just 'Hello!' and nothing else."}
                ]
            )
            print(f"✅ Success! Response: {message.content[0].text}")
            return model  # Return first working model
            
        except Exception as e:
            print(f"❌ Failed: {type(e).__name__}: {str(e)}")
    
    return None

if __name__ == "__main__":
    working_model = asyncio.run(test_claude())
    if working_model:
        print(f"\n✅ Working model found: {working_model}")
    else:
        print("\n❌ No working models found")