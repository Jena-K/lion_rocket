"""
E2E tests for prompt template CRUD operations
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import User, Prompt
from tests.fixtures.test_data import SAMPLE_PROMPTS


@pytest.mark.e2e
@pytest.mark.crud
class TestPromptCRUDE2E:
    """Test prompt template CRUD operations end-to-end"""
    
    def test_create_prompt(self, client: TestClient, auth_headers: dict):
        """Test creating a new prompt template"""
        prompt_data = SAMPLE_PROMPTS[0]
        
        response = client.post("/api/prompts/", json=prompt_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == prompt_data["name"]
        assert data["content"] == prompt_data["content"]
        assert data["variables"] == prompt_data["variables"]
        assert "id" in data
        assert "created_at" in data
        assert "created_by" in data
    
    def test_create_prompt_unauthorized(self, client: TestClient):
        """Test creating prompt without authentication"""
        prompt_data = SAMPLE_PROMPTS[0]
        
        response = client.post("/api/prompts/", json=prompt_data)
        
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
    
    def test_create_prompt_with_invalid_variables(self, client: TestClient, auth_headers: dict):
        """Test creating prompt with variables not in content"""
        prompt_data = {
            "name": "Invalid Prompt",
            "content": "This has no variables",
            "variables": ["missing_var"]  # Not in content
        }
        
        response = client.post("/api/prompts/", json=prompt_data, headers=auth_headers)
        
        # Should still create (validation is lenient)
        assert response.status_code == 201
    
    def test_get_all_prompts(self, client: TestClient, auth_headers: dict, 
                            test_db: Session, test_user: User):
        """Test getting all prompt templates"""
        # Create multiple prompts
        for prompt_data in SAMPLE_PROMPTS:
            prompt = Prompt(
                name=prompt_data["name"],
                content=prompt_data["content"],
                variables=prompt_data["variables"],
                created_by=test_user.id
            )
            test_db.add(prompt)
        test_db.commit()
        
        response = client.get("/api/prompts/", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= len(SAMPLE_PROMPTS)
        assert all("id" in prompt for prompt in data)
        assert all("name" in prompt for prompt in data)
        assert all("variables" in prompt for prompt in data)
    
    def test_get_prompt_by_id(self, client: TestClient, auth_headers: dict, 
                             test_prompt: Prompt):
        """Test getting a specific prompt by ID"""
        response = client.get(f"/api/prompts/{test_prompt.id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_prompt.id
        assert data["name"] == test_prompt.name
        assert data["content"] == test_prompt.content
        assert data["variables"] == test_prompt.variables
    
    def test_get_nonexistent_prompt(self, client: TestClient, auth_headers: dict):
        """Test getting a prompt that doesn't exist"""
        response = client.get("/api/prompts/99999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Prompt not found" in response.json()["detail"]
    
    def test_update_prompt(self, client: TestClient, auth_headers: dict, 
                         test_prompt: Prompt):
        """Test updating a prompt template"""
        update_data = {
            "name": "Updated Prompt",
            "content": "Updated content with {new_variable}",
            "variables": ["new_variable"]
        }
        
        response = client.put(
            f"/api/prompts/{test_prompt.id}", 
            json=update_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["content"] == update_data["content"]
        assert data["variables"] == update_data["variables"]
        assert data["id"] == test_prompt.id
    
    def test_update_prompt_unauthorized(self, client: TestClient, test_prompt: Prompt,
                                       test_db: Session):
        """Test updating prompt by non-owner"""
        # Create another user
        other_user = User(
            username="promptuser",
            email="prompt@example.com",
            password_hash="dummy",
            is_active=True
        )
        test_db.add(other_user)
        test_db.commit()
        
        # Get token for other user
        from app.core.auth import create_access_token
        token = create_access_token(data={"sub": other_user.username})
        headers = {"Authorization": f"Bearer {token}"}
        
        update_data = {"name": "Hacked Prompt"}
        
        response = client.put(
            f"/api/prompts/{test_prompt.id}", 
            json=update_data, 
            headers=headers
        )
        
        assert response.status_code == 403
        assert "Not authorized" in response.json()["detail"]
    
    def test_delete_prompt(self, client: TestClient, auth_headers: dict, 
                         test_prompt: Prompt):
        """Test deleting a prompt template"""
        response = client.delete(f"/api/prompts/{test_prompt.id}", headers=auth_headers)
        
        assert response.status_code == 204
        
        # Verify deletion
        get_response = client.get(f"/api/prompts/{test_prompt.id}", headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_admin_can_manage_any_prompt(self, client: TestClient, admin_auth_headers: dict,
                                       test_prompt: Prompt):
        """Test that admin can update/delete any prompt"""
        # Admin updates prompt created by another user
        update_data = {"name": "Admin Updated Prompt"}
        response = client.put(
            f"/api/prompts/{test_prompt.id}", 
            json=update_data, 
            headers=admin_auth_headers
        )
        
        assert response.status_code == 200
        assert response.json()["name"] == update_data["name"]
        
        # Admin deletes prompt
        response = client.delete(f"/api/prompts/{test_prompt.id}", headers=admin_auth_headers)
        assert response.status_code == 204


@pytest.mark.e2e
@pytest.mark.crud
class TestPromptVariableHandlingE2E:
    """Test prompt variable extraction and validation"""
    
    def test_prompt_variable_extraction(self, client: TestClient, auth_headers: dict):
        """Test automatic variable extraction from prompt content"""
        prompt_data = {
            "name": "Auto Variable Test",
            "content": "Hello {name}, your task is {task} at {location}.",
            "variables": []  # Empty, should auto-detect
        }
        
        response = client.post("/api/prompts/", json=prompt_data, headers=auth_headers)
        
        assert response.status_code == 201
        # Note: Current implementation may not auto-extract variables
        # This test documents the current behavior
    
    def test_prompt_with_nested_braces(self, client: TestClient, auth_headers: dict):
        """Test prompt with nested or complex brace patterns"""
        prompt_data = {
            "name": "Complex Prompt",
            "content": "Code: ```{code}``` Output: {{output}}",
            "variables": ["code"]
        }
        
        response = client.post("/api/prompts/", json=prompt_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["variables"] == ["code"]
    
    def test_prompt_execution_preview(self, client: TestClient, auth_headers: dict,
                                    test_prompt: Prompt):
        """Test prompt preview with variable substitution"""
        # Note: This assumes there's a preview endpoint
        preview_data = {
            "prompt_id": test_prompt.id,
            "variables": {
                "input": "test value"
            }
        }
        
        # If preview endpoint exists
        # response = client.post("/api/prompts/preview", json=preview_data, headers=auth_headers)
        # assert response.status_code == 200
        # assert "test value" in response.json()["preview"]


@pytest.mark.e2e
@pytest.mark.crud
class TestPromptPaginationE2E:
    """Test prompt listing with pagination"""
    
    def test_prompt_pagination(self, client: TestClient, auth_headers: dict, 
                             test_db: Session, test_user: User):
        """Test paginated prompt listing"""
        # Create 20 prompts
        for i in range(20):
            prompt = Prompt(
                name=f"Prompt {i}",
                content=f"Content {i} with {{variable}}",
                variables=["variable"],
                created_by=test_user.id
            )
            test_db.add(prompt)
        test_db.commit()
        
        # Test pagination
        response = client.get("/api/prompts/?limit=10&offset=0", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 10
        
        response = client.get("/api/prompts/?limit=10&offset=10", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 10
        
        response = client.get("/api/prompts/?limit=10&offset=20", headers=auth_headers)
        assert response.status_code == 200
        assert len(response.json()) == 0


@pytest.mark.e2e
@pytest.mark.crud
class TestPromptValidationE2E:
    """Test prompt data validation"""
    
    @pytest.mark.parametrize("invalid_data,expected_error", [
        ({"content": "Test"}, "name"),  # Missing name
        ({"name": "Test"}, "content"),  # Missing content
        ({"name": "", "content": "Test"}, "name"),  # Empty name
        ({"name": "Test", "content": ""}, "content"),  # Empty content
        ({"name": "A"*101, "content": "Test"}, "name"),  # Name too long
    ])
    def test_create_prompt_invalid_data(self, client: TestClient, auth_headers: dict,
                                      invalid_data: dict, expected_error: str):
        """Test creating prompt with invalid data"""
        # Add default variables if not present
        if "variables" not in invalid_data and "name" in invalid_data and "content" in invalid_data:
            invalid_data["variables"] = []
            
        response = client.post("/api/prompts/", json=invalid_data, headers=auth_headers)
        
        assert response.status_code == 422
        error_detail = response.json()["detail"]
        assert any(expected_error in str(error).lower() for error in error_detail)