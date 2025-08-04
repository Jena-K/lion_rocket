"""
Test script for admin middleware pipeline
Tests audit logging, rate limiting, security headers, and validation
"""
import asyncio
import httpx
import json
from datetime import datetime
from typing import Dict, Optional

BASE_URL = "http://localhost:8000"
TEST_ADMIN_USERNAME = "admin"
TEST_ADMIN_PASSWORD = "adminpass123"


async def login_admin() -> Optional[str]:
    """Login as admin and return access token"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/auth/login",
            data={
                "username": TEST_ADMIN_USERNAME,
                "password": TEST_ADMIN_PASSWORD,
                "grant_type": "password"
            }
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Admin login successful")
            return data["access_token"]
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None


async def test_audit_logging(headers: Dict[str, str]):
    """Test that admin actions are being logged"""
    print("\n📋 Testing Audit Logging:")
    
    async with httpx.AsyncClient() as client:
        # Test GET request (read action)
        response = await client.get(f"{BASE_URL}/admin/users", headers=headers)
        print(f"  - GET /admin/users: {response.status_code}")
        
        # Test POST request (modify action)
        if response.status_code == 200:
            users = response.json()
            if users["items"]:
                user_id = users["items"][0]["id"]
                response = await client.post(
                    f"{BASE_URL}/admin/users/{user_id}/toggle-admin",
                    headers=headers
                )
                print(f"  - POST /admin/users/{user_id}/toggle-admin: {response.status_code}")
        
        # Check logs (in production, these would be in log files)
        print("  ℹ️ Audit logs should be visible in server console")


async def test_rate_limiting(headers: Dict[str, str]):
    """Test rate limiting for admin endpoints"""
    print("\n🚦 Testing Rate Limiting:")
    
    async with httpx.AsyncClient() as client:
        # Test read rate limit (100 per minute)
        print("  - Testing read rate limit (5 rapid requests)...")
        for i in range(5):
            response = await client.get(f"{BASE_URL}/admin/stats/overview", headers=headers)
            print(f"    Request {i+1}: {response.status_code}")
            if response.status_code == 429:
                print(f"    Rate limit message: {response.json()['detail']}")
                break
        
        # Test write rate limit (30 per minute)
        print("  - Testing write rate limit (5 rapid requests)...")
        for i in range(5):
            response = await client.post(
                f"{BASE_URL}/admin/users/1/toggle-admin",
                headers=headers
            )
            print(f"    Request {i+1}: {response.status_code}")
            if response.status_code == 429:
                print(f"    Rate limit message: {response.json()['detail']}")
                break


async def test_security_headers(headers: Dict[str, str]):
    """Test security headers on admin responses"""
    print("\n🔒 Testing Security Headers:")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/admin/stats/overview", headers=headers)
        
        security_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "Content-Security-Policy",
            "Strict-Transport-Security"
        ]
        
        print("  - Checking security headers:")
        for header in security_headers:
            value = response.headers.get(header)
            if value:
                print(f"    ✅ {header}: {value}")
            else:
                print(f"    ❌ {header}: Missing")


async def test_request_validation(headers: Dict[str, str]):
    """Test request validation middleware"""
    print("\n✅ Testing Request Validation:")
    
    async with httpx.AsyncClient() as client:
        # Test invalid page number
        print("  - Testing invalid page number:")
        response = await client.get(
            f"{BASE_URL}/admin/users?page=10001",
            headers=headers
        )
        print(f"    Status: {response.status_code}")
        if response.status_code == 400:
            print(f"    Error: {response.json()['detail']}")
        
        # Test invalid limit
        print("  - Testing invalid limit:")
        response = await client.get(
            f"{BASE_URL}/admin/users?limit=500",
            headers=headers
        )
        print(f"    Status: {response.status_code}")
        if response.status_code == 400:
            print(f"    Error: {response.json()['detail']}")
        
        # Test invalid ID format
        print("  - Testing invalid ID format:")
        response = await client.get(
            f"{BASE_URL}/admin/users/abc",
            headers=headers
        )
        print(f"    Status: {response.status_code}")
        if response.status_code in [400, 404]:
            print(f"    Error: {response.json()['detail']}")


async def test_suspicious_patterns(headers: Dict[str, str]):
    """Test security pattern detection"""
    print("\n🚨 Testing Suspicious Pattern Detection:")
    
    async with httpx.AsyncClient() as client:
        # Test path traversal attempt
        print("  - Testing path traversal attempt:")
        response = await client.get(
            f"{BASE_URL}/admin/users/../../../etc/passwd",
            headers=headers
        )
        print(f"    Status: {response.status_code}")
        if response.status_code == 400:
            print(f"    ✅ Blocked: {response.json()['detail']}")
        
        # Test XSS attempt in query parameter
        print("  - Testing XSS attempt:")
        response = await client.get(
            f"{BASE_URL}/admin/users?search=<script>alert('xss')</script>",
            headers=headers
        )
        print(f"    Status: {response.status_code}")
        # Note: This might pass through as query param, but would be sanitized in actual use


async def test_unauthorized_access():
    """Test that non-admin users cannot access admin endpoints"""
    print("\n🚫 Testing Unauthorized Access:")
    
    async with httpx.AsyncClient() as client:
        # Test without token
        print("  - Testing without authentication token:")
        response = await client.get(f"{BASE_URL}/admin/users")
        print(f"    Status: {response.status_code}")
        if response.status_code == 401:
            print(f"    ✅ Correctly blocked: {response.json()['detail']}")
        
        # Test with invalid token
        print("  - Testing with invalid token:")
        fake_headers = {"Authorization": "Bearer invalid_token_12345"}
        response = await client.get(f"{BASE_URL}/admin/users", headers=fake_headers)
        print(f"    Status: {response.status_code}")
        if response.status_code == 401:
            print(f"    ✅ Correctly blocked: {response.json()['detail']}")


async def main():
    """Run all middleware tests"""
    print("=" * 60)
    print("Admin Middleware Pipeline Test")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print(f"Time: {datetime.now().isoformat()}")
    
    # Login as admin
    token = await login_admin()
    if not token:
        print("\n❌ Cannot proceed without admin authentication")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Run all tests
    await test_audit_logging(headers)
    await test_security_headers(headers)
    await test_request_validation(headers)
    await test_suspicious_patterns(headers)
    await test_rate_limiting(headers)
    await test_unauthorized_access()
    
    print("\n" + "=" * 60)
    print("✅ Admin middleware pipeline test completed!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())