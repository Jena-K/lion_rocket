#!/usr/bin/env python3
"""
Test admin API after AdminUserResponse validation fix
"""
import asyncio
import sys
from pathlib import Path

# Add project root to Python path
sys.path.append(str(Path(__file__).parent))

from fastapi.testclient import TestClient
import json

def test_admin_api():
    """Test admin API endpoints with proper authentication"""
    print("🧪 Testing Admin API endpoints")
    
    try:
        from app.main import app
        client = TestClient(app)
        
        # First login as admin to get token
        print("🔐 Logging in as admin...")
        login_response = client.post(
            "/auth/admin/login",
            data={
                "adminId": "root",
                "password": "rootpassword123"
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code != 200:
            print(f"❌ Admin login failed: {login_response.status_code}")
            print(f"   Response: {login_response.text}")
            return False
        
        login_data = login_response.json()
        token = login_data["access_token"]
        print("✅ Admin login successful")
        
        # Test get all users endpoint
        print("\n👥 Testing /admin/users endpoint...")
        headers = {"Authorization": f"Bearer {token}"}
        
        users_response = client.get("/admin/users?page=1&limit=10", headers=headers)
        
        if users_response.status_code == 200:
            print("✅ /admin/users endpoint working correctly")
            users_data = users_response.json()
            print(f"   Total users: {users_data.get('total', 0)}")
            print(f"   Users in response: {len(users_data.get('items', []))}")
            
            # Check if AdminUserResponse fields are present
            if users_data.get('items'):
                first_user = users_data['items'][0]
                required_fields = ['user_id', 'username', 'total_chats', 'total_tokens']
                missing_fields = [field for field in required_fields if field not in first_user]
                
                if missing_fields:
                    print(f"❌ Missing fields in response: {missing_fields}")
                    return False
                else:
                    print("✅ All required fields present in AdminUserResponse")
                    print(f"   user_id: {first_user['user_id']}")
                    print(f"   username: {first_user['username']}")
                    print(f"   total_chats: {first_user['total_chats']}")
                    print(f"   total_tokens: {first_user['total_tokens']}")
            
            return True
        else:
            print(f"❌ /admin/users failed: {users_response.status_code}")
            print(f"   Response: {users_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test execution failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_admin_overview():
    """Test admin overview endpoint"""
    print("\n📊 Testing /admin/stats/overview endpoint...")
    
    try:
        from app.main import app
        client = TestClient(app)
        
        # Login first
        login_response = client.post(
            "/auth/admin/login",
            data={"adminId": "root", "password": "rootpassword123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code != 200:
            print("❌ Admin login failed for overview test")
            return False
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test overview endpoint
        overview_response = client.get("/admin/stats/overview", headers=headers)
        
        if overview_response.status_code == 200:
            overview_data = overview_response.json()
            print("✅ /admin/stats/overview working correctly")
            print(f"   Total users: {overview_data.get('total_users', 0)}")
            print(f"   Active users today: {overview_data.get('active_users_today', 0)}")
            print(f"   Total conversations: {overview_data.get('total_conversations', 0)}")
            print(f"   Total messages: {overview_data.get('total_messages', 0)}")
            return True
        else:
            print(f"❌ /admin/stats/overview failed: {overview_response.status_code}")
            print(f"   Response: {overview_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Overview test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("=" * 60)
    print("🔧 Admin API Fix Verification")
    print("=" * 60)
    
    # Test admin API endpoints
    users_success = test_admin_api()
    overview_success = test_admin_overview()
    
    print("\n" + "=" * 60)
    if users_success and overview_success:
        print("✅ All admin API tests passed!")
        print("🎉 AdminUserResponse validation fix is working correctly")
    else:
        print("❌ Some admin API tests failed")
        print("🔍 Check the error messages above for details")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())