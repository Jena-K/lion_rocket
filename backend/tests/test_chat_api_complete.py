#!/usr/bin/env python3
"""Test the complete chat API flow"""

import asyncio
import httpx
import json
from datetime import datetime


async def test_chat_api():
    """Test the chat API endpoint directly"""
    
    base_url = "http://localhost:8000"
    
    # Test credentials
    test_user = {
        "username": "test_user",
        "email": "test@example.com", 
        "password": "Test1234!"
    }
    
    async with httpx.AsyncClient() as client:
        print("=" * 60)
        print("Chat API Test")
        print("=" * 60)
        
        # 1. Register/Login
        print("\n1. Logging in...")
        try:
            # Try to login first
            login_response = await client.post(
                f"{base_url}/auth/login",
                data={"username": test_user["username"], "password": test_user["password"]}
            )
            
            if login_response.status_code != 200:
                # Register if login fails
                print("   Registering new user...")
                reg_response = await client.post(
                    f"{base_url}/auth/register",
                    json=test_user
                )
                if reg_response.status_code != 200:
                    print(f"   ✗ Registration failed: {reg_response.text}")
                    return
                
                # Login after registration
                login_response = await client.post(
                    f"{base_url}/auth/login",
                    data={"username": test_user["username"], "password": test_user["password"]}
                )
            
            if login_response.status_code == 200:
                token_data = login_response.json()
                token = token_data["access_token"]
                print(f"   ✓ Logged in successfully")
            else:
                print(f"   ✗ Login failed: {login_response.text}")
                return
                
        except Exception as e:
            print(f"   ✗ Auth error: {e}")
            return
        
        # Set auth header
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Get characters
        print("\n2. Getting characters...")
        try:
            char_response = await client.get(
                f"{base_url}/characters/",
                headers=headers
            )
            if char_response.status_code == 200:
                characters = char_response.json()
                if characters:
                    character_id = characters[0]["character_id"]
                    print(f"   ✓ Found {len(characters)} characters")
                    print(f"   ✓ Using character ID: {character_id}")
                else:
                    print("   ✗ No characters found")
                    return
            else:
                print(f"   ✗ Failed to get characters: {char_response.text}")
                return
        except Exception as e:
            print(f"   ✗ Character error: {e}")
            return
        
        # 3. Send chat message
        print("\n3. Sending chat message...")
        try:
            chat_data = {
                "content": "안녕하세요! 테스트 메시지입니다.",
                "character_id": character_id
            }
            
            print(f"   → Sending: {chat_data}")
            
            chat_response = await client.post(
                f"{base_url}/chats/",
                json=chat_data,
                headers=headers,
                timeout=30.0  # 30 second timeout
            )
            
            if chat_response.status_code == 200:
                result = chat_response.json()
                print(f"   ✓ Message sent successfully!")
                print(f"   ✓ Response: {json.dumps(result, indent=2, ensure_ascii=False)}")
            else:
                print(f"   ✗ Failed to send message: {chat_response.status_code}")
                print(f"   ✗ Error: {chat_response.text}")
                
        except httpx.TimeoutException:
            print("   ✗ Request timed out after 30 seconds")
        except Exception as e:
            print(f"   ✗ Chat error: {type(e).__name__}: {e}")
        
        # 4. Get chat history
        print("\n4. Getting chat history...")
        try:
            history_response = await client.get(
                f"{base_url}/chats/",
                params={"character_id": character_id},
                headers=headers
            )
            
            if history_response.status_code == 200:
                messages = history_response.json()
                print(f"   ✓ Found {len(messages)} messages")
                if messages:
                    for msg in messages[-2:]:  # Show last 2 messages
                        role = msg.get("role", "unknown")
                        content = msg.get("content", "")[:50] + "..."
                        print(f"     - {role}: {content}")
            else:
                print(f"   ✗ Failed to get history: {history_response.text}")
                
        except Exception as e:
            print(f"   ✗ History error: {e}")
        
        print("\n" + "=" * 60)
        print("Test completed!")
        print("=" * 60)


if __name__ == "__main__":
    print("Starting Chat API test...")
    print("Make sure the backend server is running on http://localhost:8000")
    print("")
    
    asyncio.run(test_chat_api())