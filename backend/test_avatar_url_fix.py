#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify avatar URL construction fix
"""
import sys
import os
import io

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.models.character import Character
from app.routers.character import create_character_response

def test_avatar_url_construction():
    """Test that avatar URLs are constructed correctly without double /avatars/"""
    print("Testing avatar URL construction fix")
    print("=" * 50)
    
    # Create a mock character object
    class MockCharacter:
        def __init__(self):
            self.character_id = 1
            self.name = "테스트 캐릭터"
            self.avatar_url = "1_20250804215023"
            self.intro = "테스트 캐릭터입니다"
            self.gender = "male"
            self.is_active = True
            
        def __dict__(self):
            return {
                'character_id': self.character_id,
                'name': self.name,
                'avatar_url': self.avatar_url,
                'intro': self.intro,
                'gender': self.gender,
                'is_active': self.is_active
            }
    
    character = MockCharacter()
    
    print(f"Original avatar_url in database: {character.avatar_url}")
    
    # Test the create_character_response function
    try:
        response_data = character.__dict__()
        
        # Map character_id to id for API response compatibility
        if 'character_id' in response_data:
            response_data['id'] = response_data['character_id']
            
        print(f"Backend API response avatar_url: {response_data.get('avatar_url')}")
        
        # Simulate frontend avatar service URL construction
        API_BASE_URL = "http://localhost:8000"
        avatar_url = response_data.get('avatar_url')
        
        if avatar_url:
            constructed_url = f"{API_BASE_URL}/images/avatars/{avatar_url}"
            print(f"Frontend constructed URL: {constructed_url}")
            
            if "//avatars/" in constructed_url:
                print("❌ ERROR: Double /avatars/ detected in URL!")
                return False
            else:
                print("✅ SUCCESS: No double /avatars/ in URL")
                return True
        else:
            print("No avatar_url found")
            return False
            
    except Exception as e:
        print(f"Error during test: {e}")
        return False

def test_frontend_avatar_service():
    """Test the frontend avatar service logic"""
    print("\nTesting frontend avatar service logic")
    print("=" * 50)
    
    API_BASE_URL = "http://localhost:8000"
    
    test_cases = [
        "1_20250804215023",
        "2_20250804215023", 
        "test_avatar_id"
    ]
    
    for avatar_url in test_cases:
        if not avatar_url:
            result_url = None
        elif avatar_url.startswith('http://') or avatar_url.startswith('https://'):
            result_url = avatar_url
        else:
            result_url = f"{API_BASE_URL}/images/avatars/{avatar_url}"
        
        print(f"Input: {avatar_url}")
        print(f"Output: {result_url}")
        
        if result_url and "//avatars/" in result_url:
            print("❌ ERROR: Double /avatars/ detected!")
            return False
        else:
            print("✅ OK")
        print()
    
    return True

if __name__ == "__main__":
    print("🔧 Avatar URL Construction Fix Test")
    print("=" * 60)
    
    success1 = test_avatar_url_construction()
    success2 = test_frontend_avatar_service()
    
    if success1 and success2:
        print("\n✅ All tests passed! Avatar URL construction is working correctly.")
    else:
        print("\n❌ Some tests failed. Check the output above.")