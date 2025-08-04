#!/usr/bin/env python
"""Test script for admin API endpoints"""
import requests
import json
from datetime import datetime, date, timedelta
from typing import Dict, Optional

# Base URL
BASE_URL = "http://localhost:8000/api"

# Admin credentials
ADMIN_CREDENTIALS = {
    "adminId": "admin",
    "password": "lemonT104!"
}

# Test user for creating/updating
TEST_USER = {
    "username": f"testuser_{int(datetime.now().timestamp())}",
    "email": f"test_{int(datetime.now().timestamp())}@example.com",
    "password": "testpassword123"
}


def login_admin() -> Optional[Dict[str, str]]:
    """Login as admin and return headers with token"""
    print("\n=== Admin Login ===")
    response = requests.post(f"{BASE_URL}/auth/admin/login", json=ADMIN_CREDENTIALS)
    
    if response.status_code == 200:
        print("  [OK] Admin login successful")
        token_data = response.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        return headers
    else:
        print(f"  [ERROR] Admin login failed: {response.status_code} - {response.text}")
        return None


def test_user_management(headers: Dict[str, str]):
    """Test user management endpoints"""
    print("\n=== Testing User Management ===")
    
    # First create a test user
    print("1. Creating test user...")
    response = requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
    if response.status_code == 201:
        print("  [OK] Test user created")
        user_data = response.json()
        user_id = user_data["user"]["id"]
    else:
        print(f"  [ERROR] Failed to create test user: {response.status_code}")
        return
    
    # Get all users
    print("2. Getting all users...")
    response = requests.get(f"{BASE_URL}/admin/users?page=1&limit=10", headers=headers)
    if response.status_code == 200:
        print("  [OK] Users retrieved")
        data = response.json()
        print(f"  - Total users: {data['total']}")
        print(f"  - Page: {data['page']}/{data['pages']}")
        print(f"  - Users on this page: {len(data['items'])}")
    else:
        print(f"  [ERROR] Failed to get users: {response.status_code}")
    
    # Update user
    print(f"3. Updating user {user_id}...")
    update_data = {"email": "updated@example.com"}
    response = requests.put(f"{BASE_URL}/admin/users/{user_id}", json=update_data, headers=headers)
    if response.status_code == 200:
        print("  [OK] User updated")
    else:
        print(f"  [ERROR] Failed to update user: {response.status_code} - {response.text}")
    
    # Toggle admin status
    print(f"4. Toggling admin status for user {user_id}...")
    response = requests.post(f"{BASE_URL}/admin/users/{user_id}/toggle-admin", headers=headers)
    if response.status_code == 200:
        print("  [OK] Admin status toggled")
        result = response.json()
        print(f"  - New admin status: {result['is_admin']}")
    else:
        print(f"  [ERROR] Failed to toggle admin: {response.status_code}")
    
    # Get user chats
    print(f"5. Getting chats for user {user_id}...")
    response = requests.get(f"{BASE_URL}/admin/users/{user_id}/chats", headers=headers)
    if response.status_code == 200:
        print("  [OK] User chats retrieved")
        data = response.json()
        print(f"  - Total chats: {data['total']}")
    else:
        print(f"  [ERROR] Failed to get user chats: {response.status_code}")
    
    # Get user usage stats
    print(f"6. Getting usage stats for user {user_id}...")
    response = requests.get(f"{BASE_URL}/admin/users/{user_id}/usage", headers=headers)
    if response.status_code == 200:
        print("  [OK] User usage stats retrieved")
        stats = response.json()
        print(f"  - Number of stat entries: {len(stats)}")
    else:
        print(f"  [ERROR] Failed to get usage stats: {response.status_code}")
    
    # Delete user (optional - commented out to preserve test data)
    # print(f"7. Deleting user {user_id}...")
    # response = requests.delete(f"{BASE_URL}/admin/users/{user_id}", headers=headers)
    # if response.status_code == 200:
    #     print("  [OK] User deleted")
    # else:
    #     print(f"  [ERROR] Failed to delete user: {response.status_code}")


def test_character_management(headers: Dict[str, str]) -> Optional[int]:
    """Test character management endpoints"""
    print("\n=== Testing Character Management ===")
    
    # Get all characters
    print("1. Getting all characters...")
    response = requests.get(f"{BASE_URL}/admin/characters?skip=0&limit=10", headers=headers)
    if response.status_code == 200:
        print("  [OK] Characters retrieved")
        data = response.json()
        print(f"  - Total characters: {data['total']}")
        print(f"  - Characters returned: {len(data['characters'])}")
    else:
        print(f"  [ERROR] Failed to get characters: {response.status_code}")
    
    # Create character
    print("2. Creating new character...")
    character_data = {
        "name": "Test Admin Character",
        "gender": "female",
        "intro": "안녕하세요! 저는 테스트 캐릭터입니다.",
        "personality_tags": ["친절한", "활발한", "긍정적인"],
        "interest_tags": ["음악", "영화", "여행"],
        "prompt": "You are a friendly and helpful character for testing purposes."
    }
    response = requests.post(f"{BASE_URL}/admin/characters", json=character_data, headers=headers)
    if response.status_code == 201:
        print("  [OK] Character created")
        character = response.json()
        character_id = character["id"]
        print(f"  - Character ID: {character_id}")
        print(f"  - Character name: {character['name']}")
    else:
        print(f"  [ERROR] Failed to create character: {response.status_code} - {response.text}")
        return None
    
    # Update character
    print(f"3. Updating character {character_id}...")
    update_data = {
        "intro": "안녕하세요! 저는 업데이트된 테스트 캐릭터입니다.",
        "personality_tags": ["친절한", "활발한", "긍정적인", "유머러스한"]
    }
    response = requests.put(f"{BASE_URL}/admin/characters/{character_id}", json=update_data, headers=headers)
    if response.status_code == 200:
        print("  [OK] Character updated")
    else:
        print(f"  [ERROR] Failed to update character: {response.status_code}")
    
    # Toggle character active status
    print(f"4. Toggling active status for character {character_id}...")
    response = requests.post(f"{BASE_URL}/admin/characters/{character_id}/toggle-active", headers=headers)
    if response.status_code == 200:
        print("  [OK] Active status toggled")
        result = response.json()
        print(f"  - New active status: {result['is_active']}")
    else:
        print(f"  [ERROR] Failed to toggle active: {response.status_code}")
    
    # Search characters
    print("5. Searching characters...")
    response = requests.get(f"{BASE_URL}/admin/characters?search=Test", headers=headers)
    if response.status_code == 200:
        print("  [OK] Character search completed")
        data = response.json()
        print(f"  - Found {len(data['characters'])} characters matching 'Test'")
    else:
        print(f"  [ERROR] Failed to search characters: {response.status_code}")
    
    return character_id


def test_dashboard(headers: Dict[str, str]):
    """Test dashboard endpoints"""
    print("\n=== Testing Dashboard ===")
    
    # Get system overview
    print("1. Getting system overview...")
    response = requests.get(f"{BASE_URL}/admin/stats/overview", headers=headers)
    if response.status_code == 200:
        print("  [OK] System overview retrieved")
        stats = response.json()
        print(f"  - Total users: {stats['total_users']}")
        print(f"  - Active users today: {stats['active_users_today']}")
        print(f"  - Total chats: {stats['total_chats']}")
        print(f"  - Total messages: {stats['total_messages']}")
        print(f"  - Total tokens used: {stats['total_tokens_used']}")
        print(f"  - Average tokens per user: {stats['average_tokens_per_user']:.2f}")
    else:
        print(f"  [ERROR] Failed to get overview: {response.status_code}")
    
    # Get character statistics
    print("2. Getting character statistics...")
    response = requests.get(f"{BASE_URL}/admin/dashboard/character-stats", headers=headers)
    if response.status_code == 200:
        print("  [OK] Character statistics retrieved")
        data = response.json()
        print(f"  - Total characters: {data['total_characters']}")
        print(f"  - Active characters: {data['active_characters']}")
        print(f"  - Character stats entries: {len(data['character_stats'])}")
        
        # Show top 3 characters by chat count
        if data['character_stats']:
            print("\n  Top characters by chat count:")
            sorted_chars = sorted(data['character_stats'], key=lambda x: x['chat_count'], reverse=True)[:3]
            for char in sorted_chars:
                print(f"    - {char['character_name']}: {char['chat_count']} chats, {char['total_tokens']} tokens")
    else:
        print(f"  [ERROR] Failed to get character stats: {response.status_code}")
    
    # Get usage by date
    print("3. Getting usage by date...")
    end_date = date.today()
    start_date = end_date - timedelta(days=7)
    response = requests.get(
        f"{BASE_URL}/admin/dashboard/usage-by-date?start_date={start_date}&end_date={end_date}", 
        headers=headers
    )
    if response.status_code == 200:
        print("  [OK] Usage by date retrieved")
        data = response.json()
        print(f"  - Date range: {data['start_date']} to {data['end_date']}")
        print(f"  - Period totals:")
        print(f"    - Total chats: {data['period_totals']['total_chats']}")
        print(f"    - Total tokens: {data['period_totals']['total_tokens']}")
        print(f"    - Unique users: {data['period_totals']['unique_users']}")
        print(f"  - Daily stats entries: {len(data['daily_stats'])}")
    else:
        print(f"  [ERROR] Failed to get usage by date: {response.status_code}")


def test_logout(headers: Dict[str, str]):
    """Test logout functionality"""
    print("\n=== Testing Logout ===")
    print("Note: Logout is typically handled client-side by removing the token.")
    print("The token will remain valid until it expires.")
    
    # Verify token still works
    print("1. Verifying token still works...")
    response = requests.get(f"{BASE_URL}/admin/stats/overview", headers=headers)
    if response.status_code == 200:
        print("  [OK] Token is still valid")
    else:
        print("  [ERROR] Token validation failed")


def main():
    """Run all admin API tests"""
    print("Starting Admin API tests...")
    print(f"Target: {BASE_URL}")
    
    # Login as admin
    headers = login_admin()
    if not headers:
        print("\nAdmin login failed. Stopping tests.")
        return
    
    # Run test suites
    test_user_management(headers)
    character_id = test_character_management(headers)
    test_dashboard(headers)
    test_logout(headers)
    
    print("\n=== All admin tests completed ===")
    print("\nNote: Some endpoints may show empty results if there's no data.")
    print("Run the regular test_api.py first to generate some test data.")


if __name__ == "__main__":
    main()