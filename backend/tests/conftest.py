"""
Pytest configuration and fixtures for E2E tests
"""
import os
import sys
from typing import Generator, AsyncGenerator
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import asyncio

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database import Base, get_db
from app.models import User, Character, Prompt, Message
from app.core.config import settings
from app.core.auth import get_password_hash, create_access_token


# Test database URL - using in-memory SQLite for speed
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def test_db():
    """Create a test database for each test function"""
    # Create test engine with check_same_thread=False for SQLite
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    yield TestingSessionLocal()
    
    # Drop all tables after test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db: Session) -> Generator[TestClient, None, None]:
    """Create a test client with overridden database dependency"""
    
    def override_get_db():
        try:
            yield test_db
        finally:
            test_db.close()
    
    # Override the database dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Create test client
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(test_db: Session) -> User:
    """Create a test user"""
    user = User(
        username="testuser",
        email="test@example.com",
        password_hash=get_password_hash("testpassword123"),
        is_active=True,
        is_admin=False
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def test_admin(test_db: Session) -> User:
    """Create a test admin user"""
    admin = User(
        username="testadmin",
        email="admin@example.com",
        password_hash=get_password_hash("adminpassword123"),
        is_active=True,
        is_admin=True
    )
    test_db.add(admin)
    test_db.commit()
    test_db.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authentication headers for test user"""
    access_token = create_access_token(data={"sub": test_user.username})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def admin_auth_headers(test_admin: User) -> dict:
    """Create authentication headers for admin user"""
    access_token = create_access_token(data={"sub": test_admin.username})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def test_character(test_db: Session, test_user: User) -> Character:
    """Create a test character"""
    character = Character(
        name="Test Assistant",
        system_prompt="You are a helpful test assistant.",
        description="A character for testing purposes",
        created_by=test_user.id
    )
    test_db.add(character)
    test_db.commit()
    test_db.refresh(character)
    return character


@pytest.fixture
def test_prompt(test_db: Session, test_user: User) -> Prompt:
    """Create a test prompt"""
    prompt = Prompt(
        name="Test Prompt",
        content="This is a test prompt: {input}",
        variables=["input"],
        created_by=test_user.id
    )
    test_db.add(prompt)
    test_db.commit()
    test_db.refresh(prompt)
    return prompt


@pytest.fixture
def mock_claude_response(monkeypatch):
    """Mock Claude API responses"""
    async def mock_create(*args, **kwargs):
        # Return a mock response
        class MockMessage:
            class Content:
                text = "This is a mock response from Claude."
            content = [Content()]
        
        return MockMessage()
    
    # Mock the anthropic client
    monkeypatch.setattr("app.services.claude.claude_client.messages.create", mock_create)


@pytest.fixture
def mock_claude_stream_response(monkeypatch):
    """Mock Claude API streaming responses"""
    async def mock_stream(*args, **kwargs):
        # Yield mock streaming events
        events = [
            {"type": "message_start", "message": {"content": []}},
            {"type": "content_block_start", "content_block": {"text": ""}},
            {"type": "content_block_delta", "delta": {"text": "This is a "}},
            {"type": "content_block_delta", "delta": {"text": "streaming mock response."}},
            {"type": "content_block_stop"},
            {"type": "message_stop"}
        ]
        
        for event in events:
            yield event
    
    # Mock the anthropic client stream
    monkeypatch.setattr("app.services.claude.claude_client.messages.stream", mock_stream)


# Environment variable overrides for testing
@pytest.fixture(autouse=True)
def override_settings(monkeypatch):
    """Override settings for testing"""
    monkeypatch.setenv("CLAUDE_API_KEY", "test-api-key")
    monkeypatch.setenv("JWT_SECRET", "test-secret-key-for-jwt")
    monkeypatch.setenv("DATABASE_URL", TEST_DATABASE_URL)
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "1000")  # Higher limit for tests