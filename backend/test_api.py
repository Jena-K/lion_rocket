#!/usr/bin/env python
"""Test script for character selection API endpoints"""
import requests
import json
from datetime import datetime

# Base URL
BASE_URL = "http://localhost:8000/api"

# Test data
test_user = {
    "username": f"testuser_{datetime.now().timestamp()}",
    "email": f"test_{datetime.now().timestamp()}@example.com",
    "password": "testpassword123"
}


def test_auth_flow():
    """Test authentication flow"""
    print("\n=== Testing Authentication ===")
    
    # Register
    print("1. Registering user...")
    response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    if response.status_code == 201:
        print("  [OK] User registered successfully")
        user_data = response.json()
    else:
        print(f"  [ERROR] Registration failed: {response.status_code} - {response.text}")
        return None, None
    
    # Login
    print("2. Logging in...")
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code == 200:
        print("  [OK] Login successful")
        token_data = response.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        return headers, user_data
    else:
        print(f"  [ERROR] Login failed: {response.status_code} - {response.text}")
        return None, None


def test_character_operations(headers):
    """Test character CRUD operations"""
    print("\n=== Testing Character Operations ===")
    
    # Create character
    print("1. Creating character...")
    character_data = {
        "name": "Test Character",
        "gender": "female",
        "system_prompt": "You are a helpful assistant.",
        "description": "A test character for API testing"
    }
    response = requests.post(f"{BASE_URL}/characters", json=character_data, headers=headers)
    if response.status_code == 201:
        print("  [OK] Character created successfully")
        character = response.json()
        print(f"  - ID: {character['id']}")
        print(f"  - Name: {character['name']}")
        print(f"  - Gender: {character['gender']}")
        print(f"  - Is Active: {character['is_active']}")
        return character
    else:
        print(f"  [ERROR] Character creation failed: {response.status_code} - {response.text}")
        return None


def test_character_selection(headers, character_id):
    """Test character selection API"""
    print("\n=== Testing Character Selection ===")
    
    # Select character
    print(f"1. Selecting character {character_id}...")
    response = requests.post(f"{BASE_URL}/characters/{character_id}/select", headers=headers)
    if response.status_code == 200:
        print("  [OK] Character selected successfully")
        result = response.json()
        print(f"  - Message: {result['message']}")
        print(f"  - Character is_active: {result['character']['is_active']}")
        
        # Verify character is active by getting it directly
        print(f"2. Verifying character {character_id} is active...")
        response = requests.get(f"{BASE_URL}/characters/{character_id}", headers=headers)
        if response.status_code == 200:
            char_data = response.json()
            if char_data['is_active']:
                print("  [OK] Character is active")
                return True
            else:
                print("  [ERROR] Character is not active")
                return False
        else:
            print(f"  [ERROR] Failed to get character: {response.status_code}")
            return False
    else:
        print(f"  [ERROR] Failed to get active character: {response.status_code}")
        return False


def test_echo_chat(headers, character_id):
    """Test echo chat functionality"""
    print("\n=== Testing Echo Chat ===")
    
    # Create chat
    print("1. Creating chat...")
    chat_data = {
        "character_id": character_id,
        "title": "Test Echo Chat"
    }
    response = requests.post(f"{BASE_URL}/chat", json=chat_data, headers=headers)
    if response.status_code == 200:
        print("  [OK] Chat created successfully")
        chat = response.json()
        chat_id = chat["id"]
    else:
        print(f"  [ERROR] Chat creation failed: {response.status_code} - {response.text}")
        return
    
    # Send message
    print("2. Sending message...")
    message_data = {
        "content": "Hello, this is a test message!"
    }
    response = requests.post(f"{BASE_URL}/chat/{chat_id}/messages", json=message_data, headers=headers)
    if response.status_code == 200:
        print("  [OK] Message sent successfully")
        user_msg = response.json()
        print(f"  - User message: {user_msg['content']}")
    else:
        print(f"  [ERROR] Message sending failed: {response.status_code} - {response.text}")
        return
    
    # Get messages to see echo response
    print("3. Getting chat messages...")
    import time
    time.sleep(2)  # Wait for echo response
    response = requests.get(f"{BASE_URL}/chat/{chat_id}/messages", headers=headers)
    if response.status_code == 200:
        print("  [OK] Messages retrieved")
        messages = response.json()
        for msg in messages:
            print(f"  - {'User' if msg['is_from_user'] else 'AI'}: {msg['content']}")
    else:
        print(f"  [ERROR] Failed to get messages: {response.status_code}")


def main():
    """Run all tests"""
    print("Starting API tests...")
    
    # Test authentication
    headers, user_data = test_auth_flow()
    if not headers:
        print("\nAuthentication failed. Stopping tests.")
        return
    
    # Test character operations
    character = test_character_operations(headers)
    if not character:
        print("\nCharacter creation failed. Stopping tests.")
        return
    
    # Test character selection
    selection_success = test_character_selection(headers, character["id"])
    if not selection_success:
        print("\nCharacter selection failed. Stopping tests.")
        return
    
    # Test echo chat
    test_echo_chat(headers, character["id"])
    
    print("\n=== All tests completed ===")


if __name__ == "__main__":
    main()