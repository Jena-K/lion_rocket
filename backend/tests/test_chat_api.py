#!/usr/bin/env python3
"""
Test chat API to verify Claude integration
"""
import asyncio
import httpx
import json
from datetime import datetime

# Test data  
BASE_URL = "http://localhost:8000"

# We'll get a fresh token by logging in
test_user = {
    "username": "test_user",
    "email": "test@example.com",
    "password": "Test1234!"
}

# Test 1: Create a chat message
print("Testing chat creation...")
chat_data = {
    "content": "테스트 메시지",
    "character_id": 1
}

try:
    response = requests.post(f"{BASE_URL}/chats/", headers=headers, json=chat_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        chat_response = response.json()
        print(f"Chat created successfully: {chat_response}")
    else:
        print(f"Chat creation failed: {response.status_code} - {response.text}")
        
except Exception as e:
    print(f"Error creating chat: {e}")

# Test 2: Test SSE endpoint
print("\nTesting SSE endpoint...")
try:
    sse_url = f"{BASE_URL}/chats/stream/1?token={TOKEN}"
    print(f"SSE URL: {sse_url}")
    
    # Test if the SSE endpoint responds
    response = requests.get(sse_url, headers={"Accept": "text/event-stream"}, stream=True, timeout=5)
    print(f"SSE Status: {response.status_code}")
    print(f"SSE Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        print("SSE connection successful")
        # Read a few events
        for i, line in enumerate(response.iter_lines(decode_unicode=True)):
            if i > 5:  # Read only first few lines
                break
            if line:
                print(f"SSE Line {i}: {line}")
    else:
        print(f"SSE connection failed: {response.status_code} - {response.text}")
        
except requests.exceptions.Timeout:
    print("SSE connection timed out (expected for streaming)")
except Exception as e:
    print(f"SSE connection error: {e}")