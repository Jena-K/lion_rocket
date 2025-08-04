#!/usr/bin/env python3
"""
Test AdminUserResponse schema validation
"""
import sys
from pathlib import Path
from datetime import datetime

# Add project root to Python path
sys.path.append(str(Path(__file__).parent))

from app.schemas.user import AdminUserResponse

def test_admin_user_response():
    """Test AdminUserResponse schema creation"""
    print("🧪 Testing AdminUserResponse schema validation")
    
    # Test data that matches what the admin router creates
    test_data = {
        "user_id": 1,
        "username": "testuser",
        "email": "test@example.com",
        "is_admin": False,
        "is_active": True,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "total_chats": 5,
        "total_tokens": 1000,
        "last_active": datetime.now()
    }
    
    try:
        # Create AdminUserResponse instance
        admin_response = AdminUserResponse(**test_data)
        print("✅ AdminUserResponse created successfully")
        print(f"   user_id: {admin_response.user_id}")
        print(f"   total_tokens: {admin_response.total_tokens}")
        print(f"   total_chats: {admin_response.total_chats}")
        return True
        
    except Exception as e:
        print(f"❌ AdminUserResponse validation failed: {e}")
        return False

def test_with_dict_input():
    """Test with dict input similar to database result"""
    print("\n🧪 Testing with dict input (like database result)")
    
    # Simulate database user object as dict
    user_dict = {
        'id': 1,  # This is what causes the error - database has 'id' field
        'username': 'root',
        'email': 'root@lionrocket.com',
        'is_admin': True,
        'is_active': True,
        'created_at': datetime(2025, 8, 4, 7, 39, 58),
        'updated_at': None
    }
    
    try:
        # This should fail - missing user_id and total_tokens
        admin_response = AdminUserResponse(**user_dict)
        print("✅ Success (unexpected)")
        
    except Exception as e:
        print(f"❌ Expected validation error: {e}")
        
        # Show how to fix it
        fixed_data = {
            'user_id': user_dict['id'],  # Map id -> user_id
            'username': user_dict['username'],
            'email': user_dict['email'],
            'is_admin': user_dict['is_admin'],
            'is_active': user_dict['is_active'],
            'created_at': user_dict['created_at'],
            'updated_at': user_dict['updated_at'],
            'total_chats': 0,  # Add missing field
            'total_tokens': 0,  # Add missing field
            'last_active': None  # Add missing field
        }
        
        try:
            admin_response = AdminUserResponse(**fixed_data)
            print("✅ Fixed data works correctly")
            return True
        except Exception as fix_error:
            print(f"❌ Still failing: {fix_error}")
            return False

if __name__ == "__main__":
    print("=" * 60)
    print("🔍 AdminUserResponse Schema Testing")
    print("=" * 60)
    
    success1 = test_admin_user_response()
    success2 = test_with_dict_input()
    
    if success1 and success2:
        print("\n✅ All tests passed - AdminUserResponse schema is working correctly")
    else:
        print("\n❌ Some tests failed - check schema or data mapping")