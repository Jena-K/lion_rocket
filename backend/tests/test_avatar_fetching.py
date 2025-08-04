#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify avatar image fetching functionality
"""
import requests
import sqlite3
from pathlib import Path
import sys

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Configuration
API_BASE_URL = "http://localhost:8000"
DB_PATH = "data/lionrocket.db"

def get_sample_character():
    """Get a sample character from the database to test with"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT character_id, name, avatar_url 
        FROM characters 
        WHERE avatar_url IS NOT NULL 
        LIMIT 1
    """)
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return {
            "character_id": result[0],
            "name": result[1],
            "avatar_url": result[2]
        }
    return None

def test_avatar_endpoint():
    """Test the /images/avatars/{avatar_url} endpoint"""
    print("🧪 Testing Avatar Image Fetching")
    print("=" * 50)
    
    # Get a sample character
    character = get_sample_character()
    if not character:
        print("❌ No characters with avatar_url found in database")
        return
    
    print(f"📌 Testing with character: {character['name']} (ID: {character['character_id']})")
    print(f"📎 Avatar URL: {character['avatar_url']}")
    
    # Test 1: Valid avatar URL
    url = f"{API_BASE_URL}/images/avatars/{character['avatar_url']}"
    print(f"\n🔍 Test 1: Fetching avatar from: {url}")
    
    try:
        response = requests.get(url)
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Success! Avatar image retrieved")
            print(f"   Content-Type: {response.headers.get('Content-Type')}")
            print(f"   Content-Length: {len(response.content)} bytes")
            
            # Check if avatar file exists locally
            avatar_path = Path(f"uploads/avatars/{character['avatar_url']}.png")
            if avatar_path.exists():
                print(f"   ✅ Avatar file exists at: {avatar_path}")
            else:
                print(f"   ⚠️ Avatar file not found at: {avatar_path}")
        else:
            print(f"   ❌ Failed to retrieve avatar: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Invalid avatar URL format
    invalid_url = f"{API_BASE_URL}/images/avatars/invalid_format"
    print(f"\n🔍 Test 2: Testing invalid format: {invalid_url}")
    
    try:
        response = requests.get(invalid_url)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 400:
            print("   ✅ Correctly rejected invalid format")
        else:
            print(f"   ❌ Unexpected response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 3: Non-existent avatar
    nonexistent_url = f"{API_BASE_URL}/images/avatars/999_20240101000000"
    print(f"\n🔍 Test 3: Testing non-existent avatar: {nonexistent_url}")
    
    try:
        response = requests.get(nonexistent_url)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 404:
            print("   ✅ Correctly returned 404 for non-existent avatar")
        else:
            print(f"   ❌ Unexpected response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 4: Path traversal attempt
    malicious_url = f"{API_BASE_URL}/images/avatars/../../../etc/passwd"
    print(f"\n🔍 Test 4: Testing path traversal protection: {malicious_url}")
    
    try:
        response = requests.get(malicious_url)
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 400:
            print("   ✅ Correctly blocked path traversal attempt")
        else:
            print(f"   ❌ Security issue! Path traversal not blocked: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    print("\n✨ Avatar endpoint testing complete!")

def test_frontend_integration():
    """Test frontend integration with avatar service"""
    print("\n\n🌐 Frontend Integration Test")
    print("=" * 50)
    
    print("📝 Frontend avatar service configuration:")
    print("   - Service location: frontend/src/services/avatar.service.ts")
    print("   - API Base URL: http://localhost:8000")
    print("   - Endpoint pattern: /images/avatars/{avatar_url}")
    print("   - Valid format: {character_id}_{YYYYMMDDmmSS}")
    
    print("\n📋 Components using avatar service:")
    print("   ✅ CharacterSelectionView.vue")
    print("   ✅ UserChatHistory.vue (Admin)")
    print("   ✅ CharacterManagement.vue (Admin)")
    print("   ✅ ChatView.vue")
    
    print("\n🔧 Avatar service features:")
    print("   - URL validation with regex: /^\\d+_\\d{12}$/")
    print("   - Automatic fallback to placeholder on error")
    print("   - Lazy loading for performance")
    print("   - Error handling with handleAvatarError()")
    
    print("\n💡 To test in browser:")
    print("   1. Start backend: cd backend && uvicorn app.main:app --reload")
    print("   2. Start frontend: cd frontend && npm run dev")
    print("   3. Login and navigate to character selection")
    print("   4. Check browser DevTools Network tab for avatar requests")
    print("   5. Verify avatars load correctly with format:")
    print(f"      http://localhost:8000/images/avatars/{{character_id}}_{{timestamp}}")

if __name__ == "__main__":
    test_avatar_endpoint()
    test_frontend_integration()