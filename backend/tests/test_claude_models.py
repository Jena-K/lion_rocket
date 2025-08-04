#!/usr/bin/env python3
"""Test different Claude model names to find the correct one"""

import asyncio
import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from anthropic import AsyncAnthropic
from app.core.config import settings


async def test_claude_models():
    """Test various Claude model names to find working ones"""
    
    print("=" * 60)
    print("Claude Model Testing")
    print("=" * 60)
    
    # Get API key
    api_key = settings.CLAUDE_API_KEY or os.getenv('CLAUDE_API_KEY')
    if not api_key:
        print("❌ No API key found!")
        return
    
    print(f"✓ API key found: {api_key[:20]}...")
    
    # Initialize client
    client = AsyncAnthropic(api_key=api_key)
    
    # List of model names to test
    model_names = [
        # Claude 3.5 models
        "claude-3-5-sonnet-20241022",    # Latest Claude 3.5 Sonnet
        "claude-3.5-sonnet-20241022",    # Alternative format
        "claude-3-5-sonnet-latest",      # Latest alias
        "claude-3-sonnet-20240229",      # Original attempt
        
        # Claude 3 models
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
        
        # Alternative formats
        "claude-3-opus-latest",
        "claude-3-sonnet-latest",
        "claude-3-haiku-latest",
        
        # Simplified names
        "claude-3-opus",
        "claude-3-sonnet",
        "claude-3-haiku",
    ]
    
    # Test each model
    for model_name in model_names:
        print(f"\n Testing model: {model_name}")
        try:
            response = await client.messages.create(
                model=model_name,
                max_tokens=100,
                messages=[{"role": "user", "content": "Say 'Hello' in Korean."}]
            )
            
            # Extract content
            content = ""
            if response.content and len(response.content) > 0:
                content = response.content[0].text
            
            print(f"   ✅ SUCCESS! Model '{model_name}' works")
            print(f"   Response: {content}")
            print(f"   Tokens: {response.usage.input_tokens + response.usage.output_tokens}")
            
        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            
            if "404" in error_msg or "not_found" in error_msg:
                print(f"   ❌ Model not found: {model_name}")
            elif "401" in error_msg or "authentication" in error_msg.lower():
                print(f"   ❌ Authentication error - check API key")
                break
            else:
                print(f"   ❌ Error: {error_type}: {error_msg}")
    
    print("\n" + "=" * 60)
    print("Testing complete!")
    print("=" * 60)


if __name__ == "__main__":
    print("Testing Claude API models...")
    print("This will help identify the correct model name format.")
    print("")
    
    asyncio.run(test_claude_models())