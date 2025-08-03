# Backend E2E Testing Guide

## Overview

This backend includes a comprehensive End-to-End (E2E) test suite built with pytest, FastAPI's TestClient, and various testing utilities. The tests cover authentication, CRUD operations, chat functionality with Claude AI, admin operations, and system health checks.

## Test Structure

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Shared fixtures and configuration
│   ├── e2e/                 # E2E test files
│   │   ├── __init__.py
│   │   ├── test_auth.py     # Authentication tests
│   │   ├── test_characters.py # Character CRUD tests
│   │   ├── test_prompts.py  # Prompt template tests
│   │   ├── test_chat.py     # Chat API tests with Claude
│   │   ├── test_admin.py    # Admin operations tests
│   │   └── test_health.py   # Health check and misc tests
│   └── fixtures/
│       └── test_data.py     # Test data and constants
├── pytest.ini               # Pytest configuration
├── test.sh                  # Unix test runner script
└── test.ps1                 # Windows test runner script
```

## Running Tests

### Quick Start

**Windows (PowerShell):**
```powershell
.\test.ps1
```

**Unix/Linux/Mac:**
```bash
./test.sh
```

### Run Specific Test Categories

```bash
# Run only E2E tests
./test.sh --e2e

# Run only authentication tests
./test.sh --auth

# Run only CRUD tests
./test.sh --crud

# Run with coverage report
./test.sh --coverage

# Run a specific test file
./test.sh --file tests/e2e/test_auth.py

# Verbose output
./test.sh -v

# Stop on first failure
./test.sh -x
```

### Available Test Markers

- `@pytest.mark.e2e` - End-to-end tests
- `@pytest.mark.unit` - Unit tests
- `@pytest.mark.auth` - Authentication tests
- `@pytest.mark.crud` - CRUD operation tests
- `@pytest.mark.integration` - Integration tests with external services
- `@pytest.mark.slow` - Slow running tests

## Test Coverage Areas

### 1. Authentication (`test_auth.py`)
- User registration with validation
- Login with username/email
- JWT token generation and validation
- Token expiration handling
- Admin access control
- Password hashing verification
- Multi-user isolation

### 2. Character CRUD (`test_characters.py`)
- Create, read, update, delete characters
- Authorization checks (owner-only access)
- Admin override permissions
- Pagination support
- Data validation

### 3. Prompt Templates (`test_prompts.py`)
- CRUD operations for prompt templates
- Variable extraction and validation
- Authorization and admin access
- Pagination

### 4. Chat API (`test_chat.py`)
- Message sending to Claude AI (mocked)
- Chat history retrieval
- Multi-chat management
- User isolation
- Context persistence
- Streaming responses (SSE)
- Rate limiting

### 5. Admin Operations (`test_admin.py`)
- User management (list, update, delete)
- User promotion/demotion
- Content moderation
- System statistics
- Audit logging (if implemented)

### 6. Health & Misc (`test_health.py`)
- API root information
- Health check endpoint
- OpenAPI schema access
- Documentation endpoints (Swagger, ReDoc)
- Error handling (404, 405, 422)
- CORS configuration
- Security headers
- Request tracking

## Key Test Fixtures

### Database Fixtures
- `test_db` - In-memory SQLite database for each test
- `client` - FastAPI TestClient with database override

### User Fixtures
- `test_user` - Regular user account
- `test_admin` - Admin user account
- `auth_headers` - Authentication headers for regular user
- `admin_auth_headers` - Authentication headers for admin

### Data Fixtures
- `test_character` - Sample character
- `test_prompt` - Sample prompt template
- `mock_claude_response` - Mocked Claude API responses
- `mock_claude_stream_response` - Mocked streaming responses

## Environment Variables for Testing

The test suite automatically sets these environment variables:
- `TESTING=true`
- `DATABASE_URL=sqlite:///:memory:`
- `CLAUDE_API_KEY=test-api-key`
- `JWT_SECRET=test-secret-key-for-jwt`

## CI/CD Integration

The project includes GitHub Actions workflow (`.github/workflows/backend-tests.yml`) that:
- Runs tests on Python 3.11 and 3.12
- Tests against both SQLite and PostgreSQL
- Performs linting (ruff, black)
- Type checking (mypy)
- Coverage reporting (codecov)
- Security scanning (pip-audit)

## Writing New Tests

### Basic Test Structure

```python
@pytest.mark.e2e
@pytest.mark.auth
class TestNewFeatureE2E:
    """Test new feature end-to-end"""
    
    def test_feature_success(self, client: TestClient, auth_headers: dict):
        """Test successful feature operation"""
        response = client.post("/api/feature", 
                             json={"data": "value"}, 
                             headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["data"] == "value"
```

### Using Fixtures

```python
def test_with_fixtures(self, client: TestClient, test_user: User, 
                      auth_headers: dict, mock_claude_response):
    """Test using multiple fixtures"""
    # test_user provides a User instance
    # auth_headers provides authentication
    # mock_claude_response mocks Claude API calls
    pass
```

## Coverage Goals

- Minimum coverage: 80% (configured in pytest.ini)
- Target coverage: 90%+
- Focus on critical paths: authentication, chat API, data integrity

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure you're running tests from the backend directory
2. **Database errors**: Check that SQLite is available
3. **Coverage not working**: Install pytest-cov: `uv sync`
4. **Slow tests**: Use `--no-slow` to skip slow tests during development

### Debug Mode

Run tests with maximum verbosity:
```bash
pytest -vvv --tb=full tests/e2e/test_auth.py::TestAuthenticationE2E::test_login_success
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Fixtures**: Use fixtures for common setup
3. **Mocking**: Mock external services (Claude API, etc.)
4. **Assertions**: Be specific in assertions
5. **Naming**: Use descriptive test names
6. **Markers**: Apply appropriate markers for test categorization

## Performance Considerations

- Use in-memory SQLite for speed
- Mock external API calls
- Parallelize tests when possible
- Skip slow tests during rapid development

## Security Testing

The test suite includes basic security tests:
- SQL injection prevention
- XSS protection
- Authentication bypass attempts
- Authorization checks
- Rate limiting verification

For comprehensive security testing, consider additional tools like:
- OWASP ZAP
- Burp Suite
- Custom penetration testing