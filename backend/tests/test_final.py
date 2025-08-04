#!/usr/bin/env python3
"""
Final test with correct token
"""
import requests
import json

# Test data
BASE_URL = "http://localhost:8001"
CORRECT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc1NDMyMTg0M30.Jfzrj_-bmwQkAShKCw1LPyUQwYghMGPwwhIPG30MO4A"

headers = {
    "Authorization": f"Bearer {CORRECT_TOKEN}",
    "Content-Type": "application/json"
}

print("Testing chat creation with correct token...")
chat_data = {
    "content": "Test message",
    "character_id": 1
}

try:
    response = requests.post(f"{BASE_URL}/chats/", headers=headers, json=chat_data, timeout=15)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("Chat creation successful!")
        
        # Now test SSE
        print("Testing SSE connection...")
        sse_url = f"{BASE_URL}/chats/stream/1?token={CORRECT_TOKEN}"
        sse_response = requests.get(sse_url, headers={"Accept": "text/event-stream"}, stream=True, timeout=10)
        print(f"SSE Status: {sse_response.status_code}")
        
        if sse_response.status_code == 200:
            print("SSE connection successful, reading events...")
            for i, line in enumerate(sse_response.iter_lines(decode_unicode=True)):
                if i > 10:  # Read limited events
                    break
                if line:
                    print(f"SSE Event {i}: {line}")
    else:
        print(f"Chat creation failed: {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}")