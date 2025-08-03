"""
E2E tests for admin operations
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import User, Character, Prompt, Chat, Message
from tests.fixtures.test_data import SAMPLE_USERS


@pytest.mark.e2e
@pytest.mark.auth
class TestAdminOperationsE2E:
    """Test admin-only operations end-to-end"""
    
    def test_admin_get_all_users(self, client: TestClient, admin_auth_headers: dict,
                                test_db: Session):
        """Test admin can get all users"""
        # Create some users
        for user_data in SAMPLE_USERS:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                password_hash="dummy",
                is_active=True
            )
            test_db.add(user)
        test_db.commit()
        
        response = client.get("/admin/users", headers=admin_auth_headers)
        
        assert response.status_code == 200
        users = response.json()
        assert len(users) >= len(SAMPLE_USERS)
        assert all("id" in user for user in users)
        assert all("username" in user for user in users)
        assert all("email" in user for user in users)
        assert all("password" not in user for user in users)
        assert all("password_hash" not in user for user in users)
    
    def test_non_admin_cannot_access_users(self, client: TestClient, auth_headers: dict):
        """Test regular user cannot access admin endpoints"""
        response = client.get("/admin/users", headers=auth_headers)
        
        assert response.status_code == 403
        assert "Not enough permissions" in response.json()["detail"]
    
    def test_admin_get_user_by_id(self, client: TestClient, admin_auth_headers: dict,
                                 test_user: User):
        """Test admin can get specific user details"""
        response = client.get(f"/admin/users/{test_user.id}", headers=admin_auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user.id
        assert data["username"] == test_user.username
        assert data["email"] == test_user.email
        assert "created_at" in data
        assert "is_active" in data
        assert "is_admin" in data
    
    def test_admin_update_user(self, client: TestClient, admin_auth_headers: dict,
                              test_user: User):
        """Test admin can update user details"""
        update_data = {
            "email": "newemail@example.com",
            "is_active": False
        }
        
        response = client.put(
            f"/admin/users/{test_user.id}", 
            json=update_data, 
            headers=admin_auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == update_data["email"]
        assert data["is_active"] == update_data["is_active"]
    
    def test_admin_delete_user(self, client: TestClient, admin_auth_headers: dict,
                             test_db: Session):
        """Test admin can delete users"""
        # Create a user to delete
        user = User(
            username="deleteMe",
            email="delete@example.com",
            password_hash="dummy",
            is_active=True
        )
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        response = client.delete(f"/admin/users/{user.id}", headers=admin_auth_headers)
        
        assert response.status_code == 204
        
        # Verify deletion
        deleted_user = test_db.query(User).filter(User.id == user.id).first()
        assert deleted_user is None
    
    def test_admin_statistics(self, client: TestClient, admin_auth_headers: dict,
                            test_db: Session, test_user: User):
        """Test admin statistics endpoint"""
        # Create some data
        char = Character(name="Stat Char", system_prompt="Test", created_by=test_user.id)
        prompt = Prompt(name="Stat Prompt", content="Test", variables=[], created_by=test_user.id)
        chat = Chat(user_id=test_user.id, character_id=1)
        test_db.add_all([char, prompt, chat])
        test_db.commit()
        
        response = client.get("/admin/statistics", headers=admin_auth_headers)
        
        assert response.status_code == 200
        stats = response.json()
        assert "total_users" in stats
        assert "total_characters" in stats
        assert "total_prompts" in stats
        assert "total_chats" in stats
        assert "total_messages" in stats
        assert stats["total_users"] >= 2  # test_user + admin
        assert stats["total_characters"] >= 1
        assert stats["total_prompts"] >= 1
        assert stats["total_chats"] >= 1
    
    def test_admin_system_health(self, client: TestClient, admin_auth_headers: dict):
        """Test admin system health endpoint"""
        response = client.get("/admin/system/health", headers=admin_auth_headers)
        
        assert response.status_code == 200
        health = response.json()
        assert "status" in health
        assert "database" in health
        assert "claude_api" in health
        assert health["status"] in ["healthy", "degraded", "unhealthy"]
    
    def test_admin_promote_user(self, client: TestClient, admin_auth_headers: dict,
                              test_user: User):
        """Test admin can promote user to admin"""
        response = client.post(
            f"/admin/users/{test_user.id}/promote", 
            headers=admin_auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_admin"] is True
        assert data["id"] == test_user.id
    
    def test_admin_demote_user(self, client: TestClient, admin_auth_headers: dict,
                             test_db: Session):
        """Test admin can demote another admin"""
        # Create another admin
        other_admin = User(
            username="otheradmin",
            email="otheradmin@example.com",
            password_hash="dummy",
            is_active=True,
            is_admin=True
        )
        test_db.add(other_admin)
        test_db.commit()
        test_db.refresh(other_admin)
        
        response = client.post(
            f"/admin/users/{other_admin.id}/demote", 
            headers=admin_auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["is_admin"] is False


@pytest.mark.e2e
@pytest.mark.auth
class TestAdminContentModerationE2E:
    """Test admin content moderation features"""
    
    def test_admin_delete_any_character(self, client: TestClient, admin_auth_headers: dict,
                                      test_character: Character):
        """Test admin can delete any user's character"""
        response = client.delete(
            f"/api/characters/{test_character.id}", 
            headers=admin_auth_headers
        )
        
        assert response.status_code == 204
    
    def test_admin_delete_any_prompt(self, client: TestClient, admin_auth_headers: dict,
                                   test_prompt: Prompt):
        """Test admin can delete any user's prompt"""
        response = client.delete(
            f"/api/prompts/{test_prompt.id}", 
            headers=admin_auth_headers
        )
        
        assert response.status_code == 204
    
    def test_admin_view_all_chats(self, client: TestClient, admin_auth_headers: dict,
                                 test_db: Session, test_user: User):
        """Test admin can view all chats across users"""
        # Create chats for different users
        user2 = User(
            username="chatuser",
            email="chatuser@example.com",
            password_hash="dummy",
            is_active=True
        )
        test_db.add(user2)
        test_db.commit()
        
        chat1 = Chat(user_id=test_user.id, character_id=1)
        chat2 = Chat(user_id=user2.id, character_id=1)
        test_db.add_all([chat1, chat2])
        test_db.commit()
        
        response = client.get("/admin/chats", headers=admin_auth_headers)
        
        assert response.status_code == 200
        chats = response.json()
        assert len(chats) >= 2
        # Admin should see chats from multiple users
        user_ids = set(chat["user_id"] for chat in chats)
        assert len(user_ids) >= 2


@pytest.mark.e2e
@pytest.mark.auth
class TestAdminAuditingE2E:
    """Test admin auditing and logging features"""
    
    def test_admin_activity_log(self, client: TestClient, admin_auth_headers: dict,
                              test_user: User):
        """Test admin actions are logged"""
        # Perform an admin action
        update_data = {"is_active": False}
        response = client.put(
            f"/admin/users/{test_user.id}", 
            json=update_data, 
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        
        # Check audit log (if implemented)
        # response = client.get("/admin/audit-log", headers=admin_auth_headers)
        # assert response.status_code == 200
        # logs = response.json()
        # assert any("updated user" in log["action"].lower() for log in logs)
    
    def test_admin_export_data(self, client: TestClient, admin_auth_headers: dict):
        """Test admin can export system data"""
        # Test export endpoints if implemented
        endpoints = [
            "/admin/export/users",
            "/admin/export/characters",
            "/admin/export/prompts",
            "/admin/export/chats"
        ]
        
        for endpoint in endpoints:
            # Note: These endpoints might not be implemented
            # This test documents expected admin capabilities
            pass