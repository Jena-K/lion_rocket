#!/usr/bin/env python3
"""
Test script for REST API and SSE endpoints
"""
import asyncio
import aiohttp
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpass123"
}

class APITester:
    def __init__(self):
        self.session = None
        self.token = None
        self.user_id = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, *args):
        await self.session.close()
        
    async def register_or_login(self):
        """Register a new user or login if already exists"""
        # Try to register
        try:
            async with self.session.post(
                f"{BASE_URL}/auth/register",
                json=TEST_USER
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print("✅ User registered successfully")
                    self.token = data["access_token"]
                    self.user_id = data["user"]["id"]
                    return
        except:
            pass
            
        # Login if registration failed
        async with self.session.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": TEST_USER["username"],
                "password": TEST_USER["password"]
            }
        ) as resp:
            if resp.status == 200:
                data = await resp.json()
                print("✅ User logged in successfully")
                self.token = data["access_token"]
                self.user_id = data["user"]["id"]
            else:
                print(f"❌ Login failed: {resp.status}")
                
    def get_headers(self):
        """Get headers with auth token"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
    async def test_characters(self):
        """Test character endpoints"""
        print("\n📚 Testing Character Endpoints...")
        
        # Create a character
        character_data = {
            "name": "Test Assistant",
            "description": "A helpful test assistant",
            "system_prompt": "You are a helpful assistant for testing.",
            "category": "Assistant",
            "tags": ["test", "assistant"],
            "is_private": False
        }
        
        async with self.session.post(
            f"{BASE_URL}/api/characters/",
            json=character_data,
            headers=self.get_headers()
        ) as resp:
            if resp.status == 200:
                character = await resp.json()
                print(f"✅ Character created: {character['name']} (ID: {character['id']})")
                return character
            else:
                print(f"❌ Failed to create character: {resp.status}")
                return None
                
    async def test_chat_with_sse(self, character_id):
        """Test chat endpoints with SSE"""
        print("\n💬 Testing Chat Endpoints with SSE...")
        
        # Create a chat
        chat_data = {
            "character_id": character_id,
            "title": "Test Chat Session"
        }
        
        async with self.session.post(
            f"{BASE_URL}/api/chats/",
            json=chat_data,
            headers=self.get_headers()
        ) as resp:
            if resp.status == 200:
                chat = await resp.json()
                print(f"✅ Chat created: {chat['title']} (ID: {chat['id']})")
                
                # Test SSE connection
                await self.test_sse_stream(chat['id'])
                
                # Send a message
                await self.send_message(chat['id'], "Hello, this is a test message!")
                
                # Wait for AI response
                await asyncio.sleep(5)
                
                return chat
            else:
                print(f"❌ Failed to create chat: {resp.status}")
                return None
                
    async def test_sse_stream(self, chat_id):
        """Test SSE streaming"""
        print(f"\n📡 Connecting to SSE stream for chat {chat_id}...")
        
        headers = self.get_headers()
        headers["Accept"] = "text/event-stream"
        
        # Create SSE connection
        try:
            timeout = aiohttp.ClientTimeout(total=30)
            async with self.session.get(
                f"{BASE_URL}/api/chats/{chat_id}/stream",
                headers=headers,
                timeout=timeout
            ) as resp:
                if resp.status == 200:
                    print("✅ SSE connection established")
                    
                    # Read a few events
                    event_count = 0
                    async for line in resp.content:
                        if event_count >= 5:  # Limit events for test
                            break
                            
                        line = line.decode('utf-8').strip()
                        if line.startswith('data:'):
                            data = line[5:].strip()
                            try:
                                event = json.loads(data)
                                print(f"📨 SSE Event: {event}")
                                event_count += 1
                            except:
                                pass
                                
                else:
                    print(f"❌ Failed to connect to SSE: {resp.status}")
        except asyncio.TimeoutError:
            print("⏱️ SSE connection timeout (expected for test)")
        except Exception as e:
            print(f"❌ SSE error: {e}")
            
    async def send_message(self, chat_id, content):
        """Send a message to chat"""
        message_data = {
            "content": content
        }
        
        async with self.session.post(
            f"{BASE_URL}/api/chats/{chat_id}/messages",
            json=message_data,
            headers=self.get_headers()
        ) as resp:
            if resp.status == 200:
                message = await resp.json()
                print(f"✅ Message sent: {message['content'][:50]}...")
                return message
            else:
                print(f"❌ Failed to send message: {resp.status}")
                return None
                
    async def run_tests(self):
        """Run all tests"""
        print("🚀 Starting Lion Rocket REST + SSE Tests...")
        print(f"📍 Target: {BASE_URL}")
        print(f"🕐 Time: {datetime.now()}")
        
        # Test authentication
        await self.register_or_login()
        
        if not self.token:
            print("❌ Authentication failed, cannot continue tests")
            return
            
        # Test characters
        character = await self.test_characters()
        
        if character:
            # Test chat with SSE
            await self.test_chat_with_sse(character['id'])
            
        print("\n✅ Tests completed!")

async def main():
    async with APITester() as tester:
        await tester.run_tests()

if __name__ == "__main__":
    asyncio.run(main())