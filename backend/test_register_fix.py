#!/usr/bin/env python3
"""
Simple test script to verify the registration endpoint works after fixing the async database issue.
"""

import asyncio
import httpx
import json

async def test_register():
    """Test the registration endpoint"""
    base_url = "http://localhost:8000"
    
    # Test data
    test_user = {
        "username": "testuser123",
        "email": "test@example.com",
        "password": "TestPassword123!"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print("Testing user registration...")
            response = await client.post(f"{base_url}/auth/register", json=test_user)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 201:
                print("✅ Registration successful!")
                return True
            else:
                print("❌ Registration failed")
                return False
                
        except Exception as e:
            print(f"❌ Error testing registration: {e}")
            return False

async def test_health():
    """Test the health endpoint to ensure server is running"""
    base_url = "http://localhost:8000"
    
    async with httpx.AsyncClient() as client:
        try:
            print("Testing health endpoint...")
            response = await client.get(f"{base_url}/health")
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                print("✅ Health check successful!")
                return True
            else:
                print("❌ Health check failed")
                return False
                
        except Exception as e:
            print(f"❌ Error connecting to server: {e}")
            return False

async def main():
    """Main test function"""
    print("Starting API tests...")
    
    # Give server a moment to start
    await asyncio.sleep(2)
    
    # Test health first
    health_ok = await test_health()
    if not health_ok:
        print("Server is not responding. Make sure it's running on http://localhost:8000")
        return
    
    # Test registration
    await test_register()

if __name__ == "__main__":
    asyncio.run(main())