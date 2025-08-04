#!/usr/bin/env python3
"""
Test script to verify avatar system is working correctly
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "username": "testuser",
    "password": "testpass123"
}

def test_avatar_system():
    """Test the avatar system end-to-end"""
    
    print("Avatar System Test")
    print("==================")
    
    # 1. Login
    print("\n1. Logging in...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login",
        data={"username": TEST_USER["username"], "password": TEST_USER["password"]}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.status_code}")
        print(f"   Response: {login_response.text}")
        return
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # 2. Get characters
    print("\n2. Getting characters...")
    chars_response = requests.get(
        f"{BASE_URL}/characters/available",
        headers=headers
    )
    
    if chars_response.status_code != 200:
        print(f"❌ Failed to get characters: {chars_response.status_code}")
        return
    
    characters = chars_response.json()["characters"]
    print(f"✅ Found {len(characters)} characters")
    
    # 3. Check avatar URLs
    print("\n3. Checking avatar URLs...")
    for char in characters[:3]:  # Check first 3 characters
        print(f"\n   Character: {char['name']}")
        avatar_url = char.get('avatar_url')
        
        if avatar_url:
            print(f"   Avatar URL: {avatar_url}")
            
            # Try to fetch the avatar
            avatar_response = requests.get(f"{BASE_URL}{avatar_url}")
            
            if avatar_response.status_code == 200:
                print(f"   ✅ Avatar accessible")
                print(f"   Content-Type: {avatar_response.headers.get('content-type')}")
                print(f"   Size: {len(avatar_response.content)} bytes")
            else:
                print(f"   ❌ Avatar not accessible: {avatar_response.status_code}")
        else:
            print(f"   ℹ️  No avatar set")
    
    # 4. Test direct avatar access
    print("\n4. Testing direct avatar access...")
    test_avatar_url = "/avatars/test-avatar-id"
    avatar_response = requests.get(f"{BASE_URL}{test_avatar_url}")
    
    if avatar_response.status_code == 404:
        print(f"✅ Non-existent avatar returns 404 as expected")
    else:
        print(f"❓ Unexpected response: {avatar_response.status_code}")
    
    print("\n✅ Avatar system test completed!")

if __name__ == "__main__":
    test_avatar_system()