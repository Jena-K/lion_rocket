"""
E2E tests for authentication endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import User
from tests.fixtures.test_data import SAMPLE_USERS, INVALID_USER_DATA


@pytest.mark.e2e
@pytest.mark.auth
class TestAuthenticationE2E:
    """Test authentication flow end-to-end"""
    
    def test_register_new_user(self, client: TestClient):
        """Test successful user registration"""
        user_data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepassword123"
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == user_data["username"]
        assert data["email"] == user_data["email"]
        assert "id" in data
        assert "password" not in data
        assert "password_hash" not in data
    
    def test_register_duplicate_username(self, client: TestClient, test_user: User):
        """Test registration with existing username"""
        user_data = {
            "username": test_user.username,  # Existing username
            "email": "different@example.com",
            "password": "password123"
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_register_duplicate_email(self, client: TestClient, test_user: User):
        """Test registration with existing email"""
        user_data = {
            "username": "differentuser",
            "email": test_user.email,  # Existing email
            "password": "password123"
        }
        
        response = client.post("/auth/register", json=user_data)
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    @pytest.mark.parametrize("invalid_data", [
        INVALID_USER_DATA["short_username"],
        INVALID_USER_DATA["invalid_email"],
        INVALID_USER_DATA["weak_password"]
    ])
    def test_register_invalid_data(self, client: TestClient, invalid_data: dict):
        """Test registration with invalid data"""
        response = client.post("/auth/register", json=invalid_data)
        
        assert response.status_code == 422  # Validation error
        assert "detail" in response.json()
    
    def test_login_success(self, client: TestClient, test_user: User):
        """Test successful login"""
        login_data = {
            "username": test_user.username,
            "password": "testpassword123"  # Password from fixture
        }
        
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
    
    def test_login_with_email(self, client: TestClient, test_user: User):
        """Test login using email instead of username"""
        login_data = {
            "username": test_user.email,  # Using email
            "password": "testpassword123"
        }
        
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
    
    def test_login_wrong_password(self, client: TestClient, test_user: User):
        """Test login with incorrect password"""
        login_data = {
            "username": test_user.username,
            "password": "wrongpassword"
        }
        
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client: TestClient):
        """Test login with non-existent user"""
        login_data = {
            "username": "nonexistent",
            "password": "password123"
        }
        
        response = client.post("/auth/login", data=login_data)
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_get_current_user(self, client: TestClient, test_user: User, auth_headers: dict):
        """Test getting current user info with valid token"""
        response = client.get("/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user.username
        assert data["email"] == test_user.email
        assert data["id"] == test_user.id
        assert "password" not in data
    
    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token"""
        response = client.get("/auth/me")
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"
    
    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token"""
        headers = {"Authorization": "Bearer invalid-token"}
        response = client.get("/auth/me", headers=headers)
        
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]
    
    def test_token_expiry(self, client: TestClient, test_user: User, monkeypatch):
        """Test token expiration"""
        # Mock token expiration to 0 seconds
        monkeypatch.setattr("app.core.auth.ACCESS_TOKEN_EXPIRE_MINUTES", 0)
        
        # Get a token
        login_data = {
            "username": test_user.username,
            "password": "testpassword123"
        }
        response = client.post("/auth/login", data=login_data)
        token = response.json()["access_token"]
        
        # Try to use the expired token
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/auth/me", headers=headers)
        
        assert response.status_code == 401
    
    def test_admin_access_control(self, client: TestClient, test_user: User, 
                                  test_admin: User, auth_headers: dict, 
                                  admin_auth_headers: dict):
        """Test admin-only endpoint access control"""
        # Try accessing admin endpoint with regular user
        response = client.get("/admin/users", headers=auth_headers)
        assert response.status_code == 403
        assert "Not enough permissions" in response.json()["detail"]
        
        # Try with admin user
        response = client.get("/admin/users", headers=admin_auth_headers)
        assert response.status_code == 200
    
    def test_password_hashing(self, test_db: Session):
        """Test that passwords are properly hashed"""
        user = test_db.query(User).filter(User.username == "testuser").first()
        
        assert user is not None
        assert user.password_hash != "testpassword123"  # Not plain text
        assert user.password_hash.startswith("$2b$")  # bcrypt hash


@pytest.mark.e2e
@pytest.mark.auth
class TestAuthenticationFlowE2E:
    """Test complete authentication flows"""
    
    def test_full_registration_login_flow(self, client: TestClient):
        """Test complete flow: register -> login -> access protected endpoint"""
        # Step 1: Register
        user_data = {
            "username": "flowtest",
            "email": "flowtest@example.com",
            "password": "flowpassword123"
        }
        
        register_response = client.post("/auth/register", json=user_data)
        assert register_response.status_code == 201
        
        # Step 2: Login
        login_data = {
            "username": user_data["username"],
            "password": user_data["password"]
        }
        
        login_response = client.post("/auth/login", data=login_data)
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Step 3: Access protected endpoint
        headers = {"Authorization": f"Bearer {token}"}
        me_response = client.get("/auth/me", headers=headers)
        assert me_response.status_code == 200
        assert me_response.json()["username"] == user_data["username"]
    
    def test_multiple_users_isolation(self, client: TestClient):
        """Test that multiple users are properly isolated"""
        # Register two users
        users = []
        for i, user_data in enumerate(SAMPLE_USERS[:2]):
            response = client.post("/auth/register", json=user_data)
            assert response.status_code == 201
            users.append(user_data)
        
        # Login as each user and verify isolation
        for user_data in users:
            # Login
            login_response = client.post("/auth/login", data={
                "username": user_data["username"],
                "password": user_data["password"]
            })
            token = login_response.json()["access_token"]
            
            # Verify identity
            headers = {"Authorization": f"Bearer {token}"}
            me_response = client.get("/auth/me", headers=headers)
            assert me_response.json()["username"] == user_data["username"]
            assert me_response.json()["email"] == user_data["email"]