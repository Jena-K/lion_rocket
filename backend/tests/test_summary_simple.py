#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simple test to verify conversation summary functionality
"""

import httpx
import asyncio

API_URL = "http://localhost:8000"

async def test_summary():
    async with httpx.AsyncClient(base_url=API_URL, timeout=30.0) as client:
        # 1. Login
        print("1. Logging in...")
        login_resp = await client.post(
            "/auth/login",
            data={"username": "rowan", "password": "LionRocket3061@"}
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Get available characters
        print("2. Getting characters...")
        chars_resp = await client.get("/characters/available", headers=headers)
        chars = chars_resp.json()["characters"]
        print(f"   Found {len(chars)} characters")
        
        if not chars:
            print("   No characters available!")
            return
            
        character_id = chars[0]["character_id"]
        print(f"   Using character ID: {character_id}")
        
        # 3. Send 21 messages to trigger summary
        print("\n3. Sending messages...")
        for i in range(1, 22):
            msg = f"Test message {i}: This is a test message for summary generation."
            print(f"   Message {i}/21...")
            
            resp = await client.post(
                "/chats",
                json={"character_id": character_id, "content": msg},
                headers=headers
            )
            
            if resp.status_code != 200:
                print(f"   ERROR: {resp.status_code} - {resp.text}")
                break
                
            if i == 20:
                print("   *** Summary should be generated after message 20 ***")
                
        # 4. Test end conversation
        print("\n4. Testing end conversation...")
        end_resp = await client.post(
            f"/chats/end-conversation/{character_id}",
            headers=headers
        )
        
        if end_resp.status_code == 200:
            result = end_resp.json()
            print(f"   Success! Summary created: {result['summary_created']}")
        else:
            print(f"   ERROR: {end_resp.status_code} - {end_resp.text}")

if __name__ == "__main__":
    print("Conversation Summary Simple Test")
    print("=" * 50)
    asyncio.run(test_summary())