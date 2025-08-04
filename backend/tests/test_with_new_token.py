#!/usr/bin/env python3
"""
Test with new token
"""
import requests
import json

# Test data
BASE_URL = "http://localhost:8001"
NEW_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc1NDMyMTgxNn0.yY7GHIwfSSGHSSfVEGH_QSWBTr1CD-MlLm8UbNTBPik"

headers = {
    "Authorization": f"Bearer {NEW_TOKEN}",
    "Content-Type": "application/json"
}

print("Testing chat creation with new token...")
chat_data = {
    "content": "Test message with new token",
    "character_id": 1
}

try:
    response = requests.post(f"{BASE_URL}/chats/", headers=headers, json=chat_data, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print("✅ Chat creation successful!")
    else:
        print(f"❌ Chat creation failed: {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}")