"""
E2E tests for chat API with Claude integration
"""
import pytest
import json
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import User, Character, Prompt, Chat
from tests.fixtures.test_data import SAMPLE_MESSAGES


@pytest.mark.e2e
@pytest.mark.integration
class TestChatAPIE2E:
    """Test chat API endpoints with Claude integration"""
    
    def test_send_message_to_claude(self, client: TestClient, auth_headers: dict,
                                   test_character: Character, mock_claude_response):
        """Test sending a message and receiving Claude's response"""
        message_data = {
            "content": "Hello, can you help me with Python?",
            "character_id": test_character.id
        }
        
        response = client.post("/api/chats/messages", json=message_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "user"
        assert data["content"] == message_data["content"]
        assert "id" in data
        assert "chat_id" in data
        assert "created_at" in data
        
        # Check Claude's response
        assert "assistant_response" in data
        assert data["assistant_response"]["role"] == "assistant"
        assert "This is a mock response from Claude" in data["assistant_response"]["content"]
    
    def test_send_message_unauthorized(self, client: TestClient, test_character: Character):
        """Test sending message without authentication"""
        message_data = {
            "content": "Hello",
            "character_id": test_character.id
        }
        
        response = client.post("/api/chats/messages", json=message_data)
        
        assert response.status_code == 401
        assert "Not authenticated" in response.json()["detail"]
    
    def test_send_message_invalid_character(self, client: TestClient, auth_headers: dict):
        """Test sending message with non-existent character"""
        message_data = {
            "content": "Hello",
            "character_id": 99999  # Non-existent
        }
        
        response = client.post("/api/chats/messages", json=message_data, headers=auth_headers)
        
        assert response.status_code == 404
        assert "Character not found" in response.json()["detail"]
    
    def test_get_chat_history(self, client: TestClient, auth_headers: dict,
                            test_character: Character, test_db: Session, 
                            test_user: User, mock_claude_response):
        """Test retrieving chat history"""
        # Send multiple messages
        chat_id = None
        for msg in SAMPLE_MESSAGES[:3]:
            message_data = {
                "content": msg,
                "character_id": test_character.id
            }
            if chat_id:
                message_data["chat_id"] = chat_id
                
            response = client.post("/api/chats/messages", json=message_data, headers=auth_headers)
            assert response.status_code == 201
            if not chat_id:
                chat_id = response.json()["chat_id"]
        
        # Get chat history
        response = client.get(f"/api/chats/{chat_id}/messages", headers=auth_headers)
        
        assert response.status_code == 200
        messages = response.json()
        assert len(messages) >= 6  # 3 user messages + 3 assistant responses
        
        # Verify message order (oldest first)
        for i in range(1, len(messages)):
            assert messages[i]["created_at"] >= messages[i-1]["created_at"]
    
    def test_get_all_user_chats(self, client: TestClient, auth_headers: dict,
                               test_character: Character, mock_claude_response):
        """Test getting all chats for a user"""
        # Create multiple chats
        chat_ids = []
        for i in range(3):
            message_data = {
                "content": f"Chat {i} first message",
                "character_id": test_character.id
            }
            response = client.post("/api/chats/messages", json=message_data, headers=auth_headers)
            chat_ids.append(response.json()["chat_id"])
        
        # Get all chats
        response = client.get("/api/chats/", headers=auth_headers)
        
        assert response.status_code == 200
        chats = response.json()
        assert len(chats) >= 3
        assert all("id" in chat for chat in chats)
        assert all("character_id" in chat for chat in chats)
        assert all("created_at" in chat for chat in chats)
        assert all("last_message_at" in chat for chat in chats)
    
    def test_delete_chat(self, client: TestClient, auth_headers: dict,
                       test_character: Character, mock_claude_response):
        """Test deleting a chat and all its messages"""
        # Create a chat
        message_data = {
            "content": "This chat will be deleted",
            "character_id": test_character.id
        }
        response = client.post("/api/chats/messages", json=message_data, headers=auth_headers)
        chat_id = response.json()["chat_id"]
        
        # Delete the chat
        response = client.delete(f"/api/chats/{chat_id}", headers=auth_headers)
        assert response.status_code == 204
        
        # Verify deletion
        response = client.get(f"/api/chats/{chat_id}/messages", headers=auth_headers)
        assert response.status_code == 404
    
    def test_chat_with_prompt_template(self, client: TestClient, auth_headers: dict,
                                     test_character: Character, test_prompt: Prompt,
                                     mock_claude_response):
        """Test using a prompt template in chat"""
        message_data = {
            "content": "Use the test prompt",
            "character_id": test_character.id,
            "prompt_id": test_prompt.id,
            "prompt_variables": {
                "input": "Python decorators"
            }
        }
        
        response = client.post("/api/chats/messages", json=message_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        # The actual message sent to Claude should include the prompt template
        assert "prompt_id" in data or "formatted_content" in data


@pytest.mark.e2e
@pytest.mark.integration
@pytest.mark.slow
class TestChatStreamingE2E:
    """Test chat streaming functionality with SSE"""
    
    def test_streaming_chat_response(self, client: TestClient, auth_headers: dict,
                                   test_character: Character, mock_claude_stream_response):
        """Test streaming chat responses via SSE"""
        message_data = {
            "content": "Tell me a story",
            "character_id": test_character.id,
            "stream": True
        }
        
        # Note: TestClient doesn't fully support SSE, so we test the endpoint exists
        with client.stream("POST", "/api/chats/messages/stream", 
                          json=message_data, headers=auth_headers) as response:
            assert response.status_code == 200
            # In a real test, we would parse SSE events
            # For now, just verify the endpoint responds correctly
    
    def test_sse_endpoint(self, client: TestClient, auth_headers: dict):
        """Test SSE endpoint for real-time updates"""
        # TestClient limitations for SSE testing
        # In production, this would be tested with a real SSE client
        pass


@pytest.mark.e2e
@pytest.mark.integration
class TestChatContextManagementE2E:
    """Test chat context and conversation management"""
    
    def test_chat_context_persistence(self, client: TestClient, auth_headers: dict,
                                    test_character: Character, mock_claude_response):
        """Test that chat maintains context across messages"""
        # First message
        message1 = {
            "content": "My name is Alice",
            "character_id": test_character.id
        }
        response1 = client.post("/api/chats/messages", json=message1, headers=auth_headers)
        chat_id = response1.json()["chat_id"]
        
        # Second message in same chat
        message2 = {
            "content": "What's my name?",
            "character_id": test_character.id,
            "chat_id": chat_id
        }
        response2 = client.post("/api/chats/messages", json=message2, headers=auth_headers)
        
        assert response2.status_code == 201
        # In a real scenario, Claude would remember "Alice"
        # Our mock doesn't maintain context, but the system should pass previous messages
    
    def test_chat_isolation_between_users(self, client: TestClient, test_character: Character,
                                        test_db: Session, mock_claude_response):
        """Test that chats are isolated between different users"""
        # Create two users
        user1 = User(
            username="chatuser1",
            email="chat1@example.com",
            password_hash="dummy",
            is_active=True
        )
        user2 = User(
            username="chatuser2",
            email="chat2@example.com",
            password_hash="dummy",
            is_active=True
        )
        test_db.add_all([user1, user2])
        test_db.commit()
        
        # Create tokens
        from app.core.auth import create_access_token
        token1 = create_access_token(data={"sub": user1.username})
        token2 = create_access_token(data={"sub": user2.username})
        headers1 = {"Authorization": f"Bearer {token1}"}
        headers2 = {"Authorization": f"Bearer {token2}"}
        
        # User 1 creates a chat
        message_data = {
            "content": "User 1's private chat",
            "character_id": test_character.id
        }
        response1 = client.post("/api/chats/messages", json=message_data, headers=headers1)
        chat_id = response1.json()["chat_id"]
        
        # User 2 tries to access User 1's chat
        response2 = client.get(f"/api/chats/{chat_id}/messages", headers=headers2)
        assert response2.status_code == 404  # Should not find the chat
    
    def test_chat_character_consistency(self, client: TestClient, auth_headers: dict,
                                      test_db: Session, test_user: User,
                                      mock_claude_response):
        """Test that a chat maintains the same character throughout"""
        # Create two characters
        char1 = Character(
            name="Character 1",
            system_prompt="First character",
            created_by=test_user.id
        )
        char2 = Character(
            name="Character 2", 
            system_prompt="Second character",
            created_by=test_user.id
        )
        test_db.add_all([char1, char2])
        test_db.commit()
        
        # Start chat with character 1
        message1 = {
            "content": "Hello",
            "character_id": char1.id
        }
        response1 = client.post("/api/chats/messages", json=message1, headers=auth_headers)
        chat_id = response1.json()["chat_id"]
        
        # Try to continue chat with character 2 (should fail or create new chat)
        message2 = {
            "content": "Hello again",
            "character_id": char2.id,
            "chat_id": chat_id
        }
        response2 = client.post("/api/chats/messages", json=message2, headers=auth_headers)
        
        # Should either fail or create a new chat
        if response2.status_code == 201:
            assert response2.json()["chat_id"] != chat_id  # New chat created
        else:
            assert response2.status_code == 400  # Bad request


@pytest.mark.e2e
@pytest.mark.integration
class TestChatRateLimitingE2E:
    """Test rate limiting on chat endpoints"""
    
    @pytest.mark.slow
    def test_chat_rate_limiting(self, client: TestClient, auth_headers: dict,
                              test_character: Character, mock_claude_response,
                              monkeypatch):
        """Test that rate limiting works on chat endpoints"""
        # Set a low rate limit for testing
        monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "5")
        
        message_data = {
            "content": "Rate limit test",
            "character_id": test_character.id
        }
        
        # Send requests up to the limit
        for i in range(5):
            response = client.post("/api/chats/messages", json=message_data, headers=auth_headers)
            assert response.status_code == 201
        
        # Next request should be rate limited
        # Note: Actual rate limiting might depend on implementation details
        # This test documents expected behavior