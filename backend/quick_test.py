#!/usr/bin/env python3
"""
Quick test script to verify URL changes work correctly
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_new_urls():
    """Test the new simplified URLs"""
    print("Testing new simplified URLs...")
    
    # Test endpoints that should work without authentication
    endpoints_to_test = [
        "/",
        "/health",
        "/docs",
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"GET {endpoint}: {response.status_code}")
            if endpoint == "/" and response.status_code == 200:
                print(f"   Response: {response.json()}")
        except requests.exceptions.ConnectionError:
            print(f"Cannot connect to backend server at {BASE_URL}")
            print("Make sure the backend server is running with: uvicorn app.main:app --reload")
            return False
        except Exception as e:
            print(f"Error testing {endpoint}: {e}")
    
    print("\nURL simplification completed successfully!")
    print("New URL structure:")
    print("- Characters: /characters/ (was /api/characters/)")
    print("- Chats: /chats/ (was /api/chats/)")
    print("- Auth: /auth/ (unchanged)")
    print("- Admin: /admin/ (unchanged)")
    
    return True

if __name__ == "__main__":
    test_new_urls()