#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Direct API testing"""

import sys
import io
import requests

# Windows UTF-8
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Test endpoints directly
BASE_URL = "http://localhost:8000"

# 1. Login
print("1. Testing login...")
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    data={
        "username": "alice_kim",
        "password": "P@ssw0rd1@"
    }
)

if login_response.status_code == 200:
    token = login_response.json()["access_token"]
    print(f"✅ Login successful! Token: {token[:20]}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Get all characters (not user-specific)
    print("\n2. Getting all available characters...")
    char_response = requests.get(
        f"{BASE_URL}/characters/available",
        headers=headers
    )
    
    if char_response.status_code == 200:
        data = char_response.json()
        # Handle paginated response
        if isinstance(data, dict) and 'characters' in data:
            chars = data['characters']
        else:
            chars = data
            
        print(f"✅ Found {len(chars)} total characters in system")
        for i, char in enumerate(chars[:5]):  # Show first 5
            print(f"   {i+1}. {char['name']} (ID: {char['character_id']})")
    else:
        print(f"❌ Failed to get all characters: {char_response.status_code}")
        print(f"   Response: {char_response.text}")
    
    # 3. Test chat with first character
    if char_response.status_code == 200 and chars:
        print(f"\n3. Testing chat with {chars[0]['name']}...")
        chat_response = requests.post(
            f"{BASE_URL}/chats/",
            headers=headers,
            json={
                "content": "안녕하세요! 테스트 메시지입니다.",
                "character_id": chars[0]["character_id"]
            }
        )
        
        if chat_response.status_code == 200:
            result = chat_response.json()
            print("✅ Chat successful!")
            print(f"   User: {result['user_message']['content']}")
            print(f"   AI: {result['ai_message']['content'][:100]}...")
        else:
            print(f"❌ Chat failed: {chat_response.status_code}")
            print(f"   Response: {chat_response.text}")
            
else:
    print(f"❌ Login failed: {login_response.status_code}")
    print(f"   Response: {login_response.text}")