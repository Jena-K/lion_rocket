#!/usr/bin/env python3
"""
Quick chat test to trigger debug logs
"""
import requests
import json
import time

# Give server time to start
time.sleep(2)

# Test data
BASE_URL = "http://localhost:8001"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc1NDQwMTk5NH0.L29cU1AS8xoF3QoTUYIGn0Yc_ZE68PVCsDeAA3rNJPM"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

print("Testing chat creation...")
chat_data = {
    "content": "Test message",
    "character_id": 1
}

try:
    response = requests.post(f"{BASE_URL}/chats/", headers=headers, json=chat_data, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")