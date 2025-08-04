#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
대화 요약 기능 테스트 스크립트
20개 메시지마다 요약 생성 및 대화 종료 시 요약 생성 테스트
"""

import asyncio
import sys
import io
import time
from datetime import datetime
import httpx
from typing import Dict, List, Optional

# Windows 환경에서 UTF-8 인코딩 설정
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Test server URL
API_BASE_URL = "http://localhost:8000"

# Test user credentials
TEST_USER = {
    "username": "rowan",
    "password": "LionRocket3061@"
}

class ConversationSummaryTester:
    def __init__(self):
        self.client = httpx.AsyncClient(base_url=API_BASE_URL, timeout=30.0)
        self.access_token = None
        self.user_id = None
        self.character_id = None
        self.messages_sent = 0
        
    async def login(self):
        """로그인하여 액세스 토큰 획득"""
        print("🔐 Logging in...")
        response = await self.client.post(
            "/auth/login",
            data={
                "username": TEST_USER["username"],
                "password": TEST_USER["password"]
            }
        )
        if response.status_code == 200:
            data = response.json()
            self.access_token = data["access_token"]
            print(f"✅ Login successful")
            
            # Get user info
            headers = {"Authorization": f"Bearer {self.access_token}"}
            user_response = await self.client.get("/auth/me", headers=headers)
            if user_response.status_code == 200:
                user_data = user_response.json()
                self.user_id = user_data["user_id"]
                print(f"👤 User ID: {self.user_id}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            
    async def get_characters(self):
        """사용 가능한 캐릭터 목록 조회"""
        headers = {"Authorization": f"Bearer {self.access_token}"}
        # Use /available endpoint to get all active characters
        response = await self.client.get("/characters/available", headers=headers)
        if response.status_code == 200:
            data = response.json()
            return data.get("characters", [])
        return []
        
    async def select_character(self):
        """테스트할 캐릭터 선택"""
        characters = await self.get_characters()
        if not characters:
            print("❌ No characters available")
            return False
            
        print("\n📋 Available characters:")
        for idx, char in enumerate(characters):
            print(f"  {idx + 1}. {char['name']} (ID: {char['character_id']})")
            
        # Select first character for testing
        self.character_id = characters[0]['character_id']
        print(f"\n✅ Selected: {characters[0]['name']} (ID: {self.character_id})")
        return True
        
    async def send_message(self, content: str) -> Optional[Dict]:
        """메시지 전송"""
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = await self.client.post(
            "/chats",
            json={
                "character_id": self.character_id,
                "content": content
            },
            headers=headers
        )
        
        if response.status_code == 200:
            self.messages_sent += 1
            return response.json()
        else:
            print(f"❌ Failed to send message: {response.status_code}")
            print(response.text)
            return None
            
    async def check_summaries(self):
        """요약 테이블 확인 (간접적으로)"""
        print("\n📊 Summary generation check:")
        print(f"  - Total messages sent: {self.messages_sent}")
        print(f"  - Expected summaries: {self.messages_sent // 20}")
        
    async def test_20_message_summary(self):
        """20개 메시지마다 요약 생성 테스트"""
        print("\n🧪 Testing 20-message summary generation...")
        print("=" * 60)
        
        test_messages = [
            "안녕하세요! 오늘 날씨가 정말 좋네요.",
            "요즘 어떻게 지내세요?",
            "새로운 프로젝트를 시작했어요.",
            "프로그래밍은 정말 재미있는 것 같아요.",
            "파이썬이 제일 좋아하는 언어예요.",
            "FastAPI로 백엔드 개발하는 중이에요.",
            "Vue.js도 함께 사용하고 있어요.",
            "풀스택 개발자가 되고 싶어요.",
            "매일 코딩 연습을 하고 있어요.",
            "알고리즘 문제도 풀고 있어요.",
            "데이터베이스 설계도 중요하죠.",
            "클린 코드를 작성하려고 노력해요.",
            "테스트 코드도 꼭 작성해야 해요.",
            "버전 관리는 Git을 사용해요.",
            "코드 리뷰도 중요한 과정이에요.",
            "문서화도 잊으면 안 돼요.",
            "사용자 경험을 항상 고려해요.",
            "보안도 매우 중요한 부분이에요.",
            "성능 최적화도 신경 써야 해요.",
            "배포 자동화도 구축했어요.",  # 20번째 메시지 - 여기서 요약 생성됨
            "CI/CD 파이프라인을 만들었어요.",  # 21번째 메시지 시작
        ]
        
        for i, message in enumerate(test_messages, 1):
            print(f"\n📤 Message {i}/{len(test_messages)}: {message}")
            result = await self.send_message(message)
            
            if result:
                ai_response = result.get("ai_message", {}).get("content", "")
                print(f"🤖 AI: {ai_response[:100]}...")
                
                # 20번째 메시지에서 요약이 생성되는지 확인
                if i == 20:
                    print("\n⚡ Summary should be generated now (20 messages reached)!")
                    await asyncio.sleep(1)  # Give server time to process
            else:
                print(f"❌ Failed to send message {i}")
                break
                
            # Small delay between messages
            await asyncio.sleep(0.5)
            
    async def test_end_conversation_summary(self):
        """대화 종료 시 요약 생성 테스트"""
        print("\n\n🧪 Testing end-conversation summary...")
        print("=" * 60)
        
        # Send a few more messages before ending
        additional_messages = [
            "이제 대화를 마무리하려고 해요.",
            "오늘 대화 정말 즐거웠어요.",
            "다음에 또 이야기해요!",
        ]
        
        for message in additional_messages:
            print(f"\n📤 Sending: {message}")
            result = await self.send_message(message)
            if result:
                ai_response = result.get("ai_message", {}).get("content", "")
                print(f"🤖 AI: {ai_response[:100]}...")
            await asyncio.sleep(0.5)
            
        # End conversation
        print("\n🏁 Ending conversation...")
        headers = {"Authorization": f"Bearer {self.access_token}"}
        response = await self.client.post(
            f"/chats/end-conversation/{self.character_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Conversation ended successfully")
            print(f"📊 Summary created: {result.get('summary_created', False)}")
        else:
            print(f"❌ Failed to end conversation: {response.status_code}")
            print(response.text)
            
    async def run_tests(self):
        """전체 테스트 실행"""
        try:
            # Login
            await self.login()
            if not self.access_token:
                return
                
            # Select character
            if not await self.select_character():
                return
                
            # Test 20-message summary
            await self.test_20_message_summary()
            
            # Check summaries
            await self.check_summaries()
            
            # Test end-conversation summary
            await self.test_end_conversation_summary()
            
            print("\n✅ All tests completed!")
            print(f"📊 Final statistics:")
            print(f"  - Total messages sent: {self.messages_sent}")
            print(f"  - Expected summaries from 20-message rule: {self.messages_sent // 20}")
            print(f"  - End-conversation summary: 1")
            
        finally:
            await self.client.aclose()

async def main():
    print("🚀 Conversation Summary Test Script")
    print("=" * 60)
    print("This script tests:")
    print("1. Summary generation every 20 messages")
    print("2. Summary generation when ending conversation")
    print("=" * 60)
    
    tester = ConversationSummaryTester()
    await tester.run_tests()

if __name__ == "__main__":
    asyncio.run(main())