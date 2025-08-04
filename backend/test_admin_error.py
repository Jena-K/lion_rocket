"""
Test script to find the exact 500 error in admin endpoint
"""
import asyncio
import httpx

BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "lemonT104!"


async def test_admin_endpoint():
    """Test the admin users endpoint directly"""
    async with httpx.AsyncClient() as client:
        # First, login as admin
        print("1. Logging in as admin...")
        login_response = await client.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD,
                "grant_type": "password"
            }
        )
        
        if login_response.status_code != 200:
            print(f"   Login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            return
            
        token = login_response.json()["access_token"]
        print("   Login successful!")
        
        # Now test the admin users endpoint
        print("\n2. Testing /admin/users endpoint...")
        headers = {"Authorization": f"Bearer {token}"}
        
        try:
            response = await client.get(f"{BASE_URL}/admin/users", headers=headers)
            print(f"   Status code: {response.status_code}")
            
            if response.status_code == 500:
                print("   ERROR: 500 Internal Server Error")
                print(f"   Response: {response.text}")
            elif response.status_code == 200:
                print("   SUCCESS! Endpoint is working")
                data = response.json()
                print(f"   Total users: {data.get('total', 0)}")
                print(f"   Users in response: {len(data.get('items', []))}")
            else:
                print(f"   Unexpected status: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except Exception as e:
            print(f"   Request failed: {type(e).__name__}: {e}")


if __name__ == "__main__":
    print("Testing admin endpoint...")
    print("Make sure the server is running on http://localhost:8000")
    print("-" * 50)
    asyncio.run(test_admin_endpoint())