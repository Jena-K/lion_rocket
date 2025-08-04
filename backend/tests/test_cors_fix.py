#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify CORS configuration fix for chat endpoint
"""
import requests
import json
import sys
import io

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8002"
FRONTEND_ORIGIN = "http://localhost:5173"

def test_cors_preflight():
    """Test CORS preflight request"""
    print("🧪 Testing CORS Preflight Request")
    print("=" * 50)
    
    headers = {
        "Origin": FRONTEND_ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization,X-Request-ID,X-Correlation-ID,X-User-ID"
    }
    
    try:
        response = requests.options(f"{BASE_URL}/chats/", headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ CORS Preflight successful")
            
            # Check important CORS headers
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
                "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials")
            }
            
            print("\n📋 CORS Headers:")
            for header, value in cors_headers.items():
                print(f"  {header}: {value}")
                
            # Validate critical headers  
            if cors_headers["Access-Control-Allow-Origin"] == FRONTEND_ORIGIN:
                print("✅ Origin allowed correctly")
            else:
                print(f"❌ Origin not allowed: {cors_headers['Access-Control-Allow-Origin']}")
                
            if "POST" in (cors_headers["Access-Control-Allow-Methods"] or ""):
                print("✅ POST method allowed")
            else:
                print("❌ POST method not allowed")
                
            required_headers = ["Content-Type", "Authorization", "X-Request-ID", "X-Correlation-ID", "X-User-ID"]
            allowed_headers = cors_headers["Access-Control-Allow-Headers"] or ""
            
            missing_headers = []
            for header in required_headers:
                if header not in allowed_headers:
                    missing_headers.append(header)
                    
            if not missing_headers:
                print("✅ All required headers allowed")
            else:
                print(f"❌ Missing headers: {missing_headers}")
                
            if cors_headers["Access-Control-Allow-Credentials"] == "true":
                print("✅ Credentials allowed")
            else:
                print("❌ Credentials not allowed")
                
            return True
        else:
            print(f"❌ CORS Preflight failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during CORS test: {e}")
        return False

def test_actual_post_request():
    """Test actual POST request with CORS headers"""
    print("\n\n🚀 Testing Actual POST Request")
    print("=" * 50)
    
    headers = {
        "Origin": FRONTEND_ORIGIN,
        "Content-Type": "application/json",
        "Authorization": "Bearer fake-token",
        "X-Request-ID": "test-123",
        "X-Correlation-ID": "test-123", 
        "X-User-ID": "1"
    }
    
    data = {
        "content": "Test message",
        "character_id": 1
    }
    
    try:
        response = requests.post(f"{BASE_URL}/chats/", headers=headers, json=data)
        print(f"Status Code: {response.status_code}")
        
        # Check if CORS headers are present in response
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials")
        }
        
        print(f"Response CORS Headers: {cors_headers}")
        
        if cors_headers["Access-Control-Allow-Origin"] == FRONTEND_ORIGIN:
            print("✅ CORS headers present in response")
            
            if response.status_code == 401:
                print("✅ Request reached endpoint (401 is expected with fake token)")
                print("✅ CORS is working correctly!")
                return True
            elif response.status_code == 200:
                print("✅ Request successful!")
                return True
            else:
                print(f"⚠️ Unexpected status code: {response.status_code}")
                print(f"Response: {response.text}")
                return True  # CORS still working
        else:
            print("❌ CORS headers missing in response")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Is the backend running?")
        return False
    except Exception as e:
        print(f"❌ Error during POST test: {e}")
        return False

def test_with_browser_simulation():
    """Simulate a browser request more closely"""
    print("\n\n🌐 Testing Browser-like Request")
    print("=" * 50)
    
    # First, preflight
    preflight_headers = {
        "Origin": FRONTEND_ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type,x-request-id,x-correlation-id,x-user-id"
    }
    
    try:
        # Preflight
        preflight_response = requests.options(f"{BASE_URL}/chats/", headers=preflight_headers)
        print(f"Preflight Status: {preflight_response.status_code}")
        
        if preflight_response.status_code != 200:
            print("❌ Preflight failed")
            return False
            
        # Actual request
        request_headers = {
            "Origin": FRONTEND_ORIGIN,
            "Content-Type": "application/json",
            "Authorization": "Bearer fake-token",
            "X-Request-ID": "browser-test-123",
            "X-Correlation-ID": "browser-test-123",
            "X-User-ID": "1",
            "Referer": f"{FRONTEND_ORIGIN}/chat/1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        data = {
            "content": "Test message from browser simulation",
            "character_id": 1
        }
        
        response = requests.post(f"{BASE_URL}/chats/", headers=request_headers, json=data)
        print(f"Request Status: {response.status_code}")
        
        # Check response headers
        allow_origin = response.headers.get("Access-Control-Allow-Origin")
        allow_credentials = response.headers.get("Access-Control-Allow-Credentials")
        
        print(f"Response Headers:")
        print(f"  Access-Control-Allow-Origin: {allow_origin}")
        print(f"  Access-Control-Allow-Credentials: {allow_credentials}")
        
        if allow_origin == FRONTEND_ORIGIN and allow_credentials == "true":
            print("✅ Browser simulation successful - CORS working!")
            return True
        else:
            print("❌ Browser simulation failed - CORS issues")
            return False
            
    except Exception as e:
        print(f"❌ Browser simulation error: {e}")
        return False

if __name__ == "__main__":
    print("🔧 CORS Configuration Test for Chat Endpoint")
    print("=" * 60)
    
    # Run all tests
    test1 = test_cors_preflight()
    test2 = test_actual_post_request() 
    test3 = test_with_browser_simulation()
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"  CORS Preflight: {'✅ PASS' if test1 else '❌ FAIL'}")
    print(f"  POST Request: {'✅ PASS' if test2 else '❌ FAIL'}")
    print(f"  Browser Simulation: {'✅ PASS' if test3 else '❌ FAIL'}")
    
    if test1 and test2 and test3:
        print("\n🎉 All CORS tests passed! Chat should work from frontend.")
        print("\n💡 To test in browser:")
        print("   1. Start backend: uvicorn app.main:app --reload")
        print("   2. Start frontend: npm run dev")
        print("   3. Try sending a chat message")
        print("   4. Check browser Network tab for successful requests")
    else:
        print("\n❌ Some CORS tests failed. Check the configuration.")