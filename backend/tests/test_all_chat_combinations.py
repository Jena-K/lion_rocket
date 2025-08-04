#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test all user-character chat combinations"""

import asyncio
import aiohttp
import sys
import io
from datetime import datetime

# Windows UTF-8
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Test configuration
API_BASE_URL = "http://localhost:8000"

# Test users (selecting a few for testing)
TEST_USERS = [
    {"username": "alice_kim", "password": "P@ssw0rd1@"},
    {"username": "john_doe", "password": "P@ssw0rd1@"},
    {"username": "sarah_park", "password": "P@ssw0rd1@"},
]

# Test messages for each character
TEST_MESSAGES = {
    1: "민준씨, 최근에 본 영화 중에 추천할 만한 게 있나요?",  # 민준
    2: "서연씨, 프로그래밍 하면서 가장 뿌듯했던 순간은 언제였나요?",  # 서연
    3: "지우씨, 익스트림 스포츠 중에 처음 도전하기 좋은 걸 추천해 주세요!",  # 지우
}

async def test_user_login(session, username, password):
    """Test user login and return token"""
    try:
        login_data = aiohttp.FormData()
        login_data.add_field('username', username)
        login_data.add_field('password', password)
        
        async with session.post(f"{API_BASE_URL}/auth/login", data=login_data) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data["access_token"]
            else:
                print(f"   ❌ Login failed for {username}: {resp.status}")
                return None
    except Exception as e:
        print(f"   ❌ Login error for {username}: {e}")
        return None

async def get_characters(session, token):
    """Get available characters"""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        async with session.get(f"{API_BASE_URL}/characters/available", headers=headers) as resp:
            if resp.status == 200:
                data = await resp.json()
                return data.get('characters', [])
            else:
                print(f"   ❌ Failed to get characters: {resp.status}")
                return []
    except Exception as e:
        print(f"   ❌ Error getting characters: {e}")
        return []

async def send_chat_message(session, token, character_id, message):
    """Send a chat message and get response"""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        async with session.post(
            f"{API_BASE_URL}/chats/",
            headers=headers,
            json={"content": message, "character_id": character_id}
        ) as resp:
            if resp.status == 200:
                return await resp.json()
            else:
                error_text = await resp.text()
                print(f"   ❌ Chat failed: {resp.status} - {error_text[:100]}...")
                return None
    except Exception as e:
        print(f"   ❌ Chat error: {e}")
        return None

async def test_all_combinations():
    """Test all user-character chat combinations"""
    print("🚀 COMPREHENSIVE CHAT TEST")
    print("=" * 80)
    print(f"Testing {len(TEST_USERS)} users with all available characters")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    results = {
        "total_tests": 0,
        "successful": 0,
        "failed": 0,
        "details": []
    }
    
    async with aiohttp.ClientSession() as session:
        for user_idx, user in enumerate(TEST_USERS, 1):
            print(f"\n👤 User {user_idx}/{len(TEST_USERS)}: {user['username']}")
            print("-" * 60)
            
            # Login
            print(f"   🔐 Logging in...")
            token = await test_user_login(session, user['username'], user['password'])
            if not token:
                results["failed"] += 3  # Count all character tests as failed
                continue
            print(f"   ✅ Login successful!")
            
            # Get characters
            print(f"   🎭 Getting characters...")
            characters = await get_characters(session, token)
            if not characters:
                results["failed"] += 3
                continue
            print(f"   ✅ Found {len(characters)} characters")
            
            # Test chat with each character
            for char in characters:
                char_id = char['character_id']
                char_name = char['name']
                
                print(f"\n   💬 Testing chat with {char_name} (ID: {char_id})")
                
                # Get appropriate test message
                test_message = TEST_MESSAGES.get(char_id, "안녕하세요! 오늘 기분이 어떠세요?")
                print(f"      📤 Sending: {test_message}")
                
                # Send chat
                start_time = datetime.now()
                response = await send_chat_message(session, token, char_id, test_message)
                end_time = datetime.now()
                response_time = (end_time - start_time).total_seconds()
                
                results["total_tests"] += 1
                
                if response:
                    ai_response = response['ai_message']['content']
                    results["successful"] += 1
                    
                    print(f"      ✅ Success! Response time: {response_time:.2f}s")
                    print(f"      🤖 AI: {ai_response[:100]}...")
                    
                    results["details"].append({
                        "user": user['username'],
                        "character": char_name,
                        "status": "success",
                        "response_time": response_time,
                        "message_preview": ai_response[:50]
                    })
                else:
                    results["failed"] += 1
                    results["details"].append({
                        "user": user['username'],
                        "character": char_name,
                        "status": "failed",
                        "response_time": response_time
                    })
    
    # Print summary
    print("\n" + "=" * 80)
    print("📊 TEST SUMMARY")
    print("=" * 80)
    print(f"Total Tests: {results['total_tests']}")
    print(f"Successful: {results['successful']} ({results['successful']/results['total_tests']*100:.1f}%)")
    print(f"Failed: {results['failed']} ({results['failed']/results['total_tests']*100:.1f}%)")
    
    # Print detailed results
    print("\n📋 DETAILED RESULTS:")
    print("-" * 80)
    print(f"{'User':<15} {'Character':<15} {'Status':<10} {'Time (s)':<10} {'Response Preview':<30}")
    print("-" * 80)
    
    for detail in results["details"]:
        preview = detail.get('message_preview', 'N/A')[:30]
        print(f"{detail['user']:<15} {detail['character']:<15} {detail['status']:<10} "
              f"{detail['response_time']:<10.2f} {preview:<30}")
    
    print("\n✅ Test completed!")
    return results

if __name__ == "__main__":
    asyncio.run(test_all_combinations())