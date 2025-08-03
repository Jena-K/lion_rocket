"""
E2E tests for character CRUD operations
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import User, Character
from tests.fixtures.test_data import SAMPLE_CHARACTERS


@pytest.mark.e2e
@pytest.mark.crud
class TestCharacterCRUDE2E:
    """Test character CRUD operations end-to-end"""
    
    def test_create_character(self, client: TestClient, auth_headers: dict):
        """Test creating a new character"""
        character_data = SAMPLE_CHARACTERS[0]
        
        response = client.post("/api/characters/", json=character_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == character_data["name"]
        assert data["system_prompt"] == character_data["system_prompt"]
        assert data["description"] == character_data["description"]
        assert "id" in data
        assert "created_at" in data
        assert "created_by" in data
    
    def test_create_character_unauthorized(self, client: TestClient):
        """Test creating character without authentication"""
        character_data = SAMPLE_CHARACTERS[0]
        
        response = client.post("/api/characters/", json=character_data)
        
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
    
    def test_create_character_duplicate_name(self, client: TestClient, auth_headers: dict, 
                                           test_character: Character):
        """Test creating character with duplicate name"""
        character_data = {
            "name": test_character.name,  # Duplicate name
            "system_prompt": "Different prompt",
            "description": "Different description"
        }
        
        response = client.post("/api/characters/", json=character_data, headers=auth_headers)
        
        # Should allow duplicate names (business decision)
        assert response.status_code == 201
    
    def test_get_all_characters(self, client: TestClient, auth_headers: dict, 
                               test_db: Session, test_user: User):
        """Test getting all characters"""
        # Create multiple characters
        for char_data in SAMPLE_CHARACTERS:
            character = Character(
                name=char_data["name"],
                system_prompt=char_data["system_prompt"],
                description=char_data["description"],
                created_by=test_user.id
            )
            test_db.add(character)
        test_db.commit()
        
        response = client.get("/api/characters/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= len(SAMPLE_CHARACTERS)
        assert all("id" in char for char in data)
        assert all("name" in char for char in data)
    
    def test_get_character_by_id(self, client: TestClient, auth_headers: dict, 
                                test_character: Character):
        """Test getting a specific character by ID"""
        response = client.get(f"/api/characters/{test_character.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_character.id
        assert data["name"] == test_character.name
        assert data["system_prompt"] == test_character.system_prompt
        assert data["description"] == test_character.description
    
    def test_get_nonexistent_character(self, client: TestClient, auth_headers: dict):
        """Test getting a character that doesn't exist"""
        response = client.get("/api/characters/99999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Character not found" in response.json()["detail"]
    
    def test_update_character(self, client: TestClient, auth_headers: dict, 
                            test_character: Character):
        """Test updating a character"""
        update_data = {
            "name": "Updated Assistant",
            "system_prompt": "Updated system prompt",
            "description": "Updated description"
        }
        
        response = client.put(
            f"/api/characters/{test_character.id}", 
            json=update_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["system_prompt"] == update_data["system_prompt"]
        assert data["description"] == update_data["description"]
        assert data["id"] == test_character.id
    
    def test_update_character_unauthorized(self, client: TestClient, test_character: Character,
                                          test_db: Session):
        """Test updating character by non-owner"""
        # Create another user
        other_user = User(
            username="otheruser",
            email="other@example.com",
            password_hash="dummy",
            is_active=True
        )
        test_db.add(other_user)
        test_db.commit()
        
        # Get token for other user
        from app.core.auth import create_access_token
        token = create_access_token(data={"sub": other_user.username})
        headers = {"Authorization": f"Bearer {token}"}
        
        update_data = {"name": "Hacked Name"}
        
        response = client.put(
            f"/api/characters/{test_character.id}", 
            json=update_data, 
            headers=headers
        )
        
        assert response.status_code == 403
        assert "Not authorized" in response.json()["detail"]
    
    def test_delete_character(self, client: TestClient, auth_headers: dict, 
                            test_character: Character):
        """Test deleting a character"""
        response = client.delete(f"/api/characters/{test_character.id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify deletion
        get_response = client.get(f"/api/characters/{test_character.id}", headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_delete_character_unauthorized(self, client: TestClient, test_character: Character,
                                          test_db: Session):
        """Test deleting character by non-owner"""
        # Create another user
        other_user = User(
            username="deleteuser",
            email="delete@example.com",
            password_hash="dummy",
            is_active=True
        )
        test_db.add(other_user)
        test_db.commit()
        
        # Get token for other user
        from app.core.auth import create_access_token
        token = create_access_token(data={"sub": other_user.username})
        headers = {"Authorization": f"Bearer {token}"}
        
        response = client.delete(f"/api/characters/{test_character.id}", headers=headers)
        
        assert response.status_code == 403
    
    def test_admin_can_manage_any_character(self, client: TestClient, admin_auth_headers: dict,
                                          test_character: Character):
        """Test that admin can update/delete any character"""
        # Admin updates character created by another user
        update_data = {"name": "Admin Updated"}
        response = client.put(
            f"/api/characters/{test_character.id}", 
            json=update_data, 
            headers=admin_auth_headers
        )
        
        assert response.status_code == 200
        assert response.json()["name"] == update_data["name"]
        
        # Admin deletes character
        response = client.delete(f"/api/characters/{test_character.id}", headers=admin_auth_headers)
        assert response.status_code == 204


@pytest.mark.e2e
@pytest.mark.crud
class TestCharacterPaginationE2E:
    """Test character listing with pagination"""
    
    def test_character_pagination(self, client: TestClient, auth_headers: dict, 
                                test_db: Session, test_user: User):
        """Test paginated character listing"""
        # Create 15 characters
        for i in range(15):
            character = Character(
                name=f"Character {i}",
                system_prompt=f"System prompt {i}",
                created_by=test_user.id
            )
            test_db.add(character)
        test_db.commit()
        
        # Test first page
        response = client.get("/api/characters/?limit=5&offset=0", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        
        # Test second page
        response = client.get("/api/characters/?limit=5&offset=5", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        
        # Test last page
        response = client.get("/api/characters/?limit=5&offset=15", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0  # No more characters


@pytest.mark.e2e
@pytest.mark.crud
class TestCharacterValidationE2E:
    """Test character data validation"""
    
    @pytest.mark.parametrize("invalid_data,expected_error", [
        ({"system_prompt": "Test"}, "name"),  # Missing name
        ({"name": "Test"}, "system_prompt"),  # Missing system_prompt
        ({"name": "", "system_prompt": "Test"}, "name"),  # Empty name
        ({"name": "Test", "system_prompt": ""}, "system_prompt"),  # Empty prompt
        ({"name": "A"*201, "system_prompt": "Test"}, "name"),  # Name too long
    ])
    def test_create_character_invalid_data(self, client: TestClient, auth_headers: dict,
                                         invalid_data: dict, expected_error: str):
        """Test creating character with invalid data"""
        response = client.post("/api/characters/", json=invalid_data, headers=auth_headers)
        
        assert response.status_code == 422
        error_detail = response.json()["detail"]
        assert any(expected_error in str(error).lower() for error in error_detail)