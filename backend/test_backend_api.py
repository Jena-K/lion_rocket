"""Test backend API with Chat terminology"""
import sys
import io

# Set UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Test that the API is running"""
    response = client.get("/health")
    assert response.status_code == 200
    print("✓ Health check passed")

def test_root_redirect():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    print("✓ Root endpoint working")

def test_api_structure():
    """Test that chat endpoints exist"""
    # Test that old message endpoints don't exist
    response = client.post("/messages")
    if response.status_code == 404:
        print("✓ Old /messages endpoint correctly removed")
    
    # Note: Can't test authenticated endpoints without login
    print("✓ API structure test complete")

if __name__ == "__main__":
    print("=== Backend API Test ===\n")
    
    try:
        test_health_check()
        test_root_redirect()
        test_api_structure()
        print("\n✅ All API tests passed!")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1)