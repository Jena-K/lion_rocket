#!/usr/bin/env python3
"""
Quick test script to verify backend server is running and accessible
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_server_status():
    """Test if the server is running and accessible"""
    print("🔍 Testing backend server connectivity...\n")
    
    # Test 1: Root endpoint
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Root endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend server at http://localhost:8000")
        print("   Make sure the backend server is running with: uvicorn app.main:app --reload")
        return False
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
        return False
    
    # Test 2: Health endpoint
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"\n✅ Health endpoint: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"\n❌ Health endpoint error: {e}")
    
    # Test 3: API docs
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"\n✅ API docs available: {response.status_code}")
    except Exception as e:
        print(f"\n❌ API docs error: {e}")
    
    # Test 4: Check CORS headers
    try:
        response = requests.options(f"{BASE_URL}/", headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        })
        print(f"\n✅ CORS preflight: {response.status_code}")
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
        }
        print(f"   CORS headers: {json.dumps(cors_headers, indent=2)}")
    except Exception as e:
        print(f"\n❌ CORS test error: {e}")
    
    print("\n" + "="*50)
    print("📋 Next steps:")
    print("1. If server is not running, start it with:")
    print("   cd backend && uvicorn app.main:app --reload")
    print("2. Make sure you have created an admin user")
    print("3. Run create_default_characters.py to add characters")
    
    return True

if __name__ == "__main__":
    test_server_status()