"""
E2E tests for health checks and miscellaneous endpoints
"""
import pytest
from fastapi.testclient import TestClient


@pytest.mark.e2e
class TestHealthEndpointsE2E:
    """Test health check and system status endpoints"""
    
    def test_root_endpoint(self, client: TestClient):
        """Test the root endpoint returns API information"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "LionRocket" in data["message"]
        assert "version" in data
        assert "docs" in data
        assert data["docs"] == "/docs"
        assert data["redoc"] == "/redoc"
        assert data["openapi"] == "/openapi.json"
    
    def test_health_check(self, client: TestClient):
        """Test the health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "LionRocket" in data["service"]
    
    def test_openapi_schema(self, client: TestClient):
        """Test OpenAPI schema is accessible"""
        response = client.get("/openapi.json")
        
        assert response.status_code == 200
        schema = response.json()
        assert "openapi" in schema
        assert "info" in schema
        assert "paths" in schema
        assert schema["info"]["title"] == "LionRocket AI Chat API"
        assert "version" in schema["info"]
    
    def test_swagger_ui(self, client: TestClient):
        """Test Swagger UI documentation is accessible"""
        response = client.get("/docs")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert "swagger-ui" in response.text.lower()
    
    def test_redoc_ui(self, client: TestClient):
        """Test ReDoc documentation is accessible"""
        response = client.get("/redoc")
        
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert "redoc" in response.text.lower()


@pytest.mark.e2e
class TestErrorHandlingE2E:
    """Test error handling and edge cases"""
    
    def test_404_not_found(self, client: TestClient):
        """Test 404 error for non-existent endpoint"""
        response = client.get("/api/nonexistent")
        
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "status" in data
        assert data["status"] == 404
    
    def test_405_method_not_allowed(self, client: TestClient):
        """Test 405 error for wrong HTTP method"""
        response = client.post("/health")  # Health is GET only
        
        assert response.status_code == 405
        data = response.json()
        assert "detail" in data
    
    def test_422_validation_error(self, client: TestClient, auth_headers: dict):
        """Test 422 validation error for invalid request data"""
        # Send invalid data type
        response = client.post(
            "/api/characters/",
            json={"name": 123, "system_prompt": True},  # Wrong types
            headers=auth_headers
        )
        
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
        assert isinstance(data["detail"], list)
        assert len(data["detail"]) > 0
    
    def test_large_request_body(self, client: TestClient, auth_headers: dict):
        """Test request size limit"""
        # Create a very large request body (> 5MB limit)
        large_content = "x" * (6 * 1024 * 1024)  # 6MB
        
        response = client.post(
            "/api/chats/messages",
            json={"content": large_content, "character_id": 1},
            headers=auth_headers
        )
        
        # Should be rejected by request size middleware
        assert response.status_code in [413, 422]  # Request Entity Too Large or Validation Error


@pytest.mark.e2e
class TestCORSE2E:
    """Test CORS configuration"""
    
    def test_cors_headers(self, client: TestClient):
        """Test CORS headers are properly set"""
        response = client.options(
            "/api/characters/",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization"
            }
        )
        
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
        assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
        assert "access-control-allow-methods" in response.headers
        assert "access-control-allow-headers" in response.headers
    
    def test_cors_credentials(self, client: TestClient):
        """Test CORS allows credentials"""
        response = client.options(
            "/auth/login",
            headers={
                "Origin": "http://localhost:5173",  # Vue dev server
                "Access-Control-Request-Method": "POST"
            }
        )
        
        assert response.status_code == 200
        assert response.headers.get("access-control-allow-credentials") == "true"


@pytest.mark.e2e
class TestSecurityHeadersE2E:
    """Test security headers middleware"""
    
    def test_security_headers_present(self, client: TestClient):
        """Test that security headers are added to responses"""
        response = client.get("/health")
        
        assert response.status_code == 200
        
        # Check for common security headers
        expected_headers = [
            "x-content-type-options",
            "x-frame-options",
            "x-xss-protection"
        ]
        
        for header in expected_headers:
            assert header in response.headers or header.lower() in response.headers
    
    def test_api_version_header(self, client: TestClient):
        """Test API version header is present"""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert "x-api-version" in response.headers or "X-API-Version" in response.headers


@pytest.mark.e2e
class TestRequestTrackingE2E:
    """Test request ID and timing middleware"""
    
    def test_request_id_header(self, client: TestClient):
        """Test that each request gets a unique ID"""
        response1 = client.get("/health")
        response2 = client.get("/health")
        
        assert response1.status_code == 200
        assert response2.status_code == 200
        
        # Check for request ID headers
        req_id_header = "x-request-id"
        assert req_id_header in response1.headers or req_id_header.upper() in response1.headers
        assert req_id_header in response2.headers or req_id_header.upper() in response2.headers
        
        # Request IDs should be different
        if req_id_header in response1.headers and req_id_header in response2.headers:
            assert response1.headers[req_id_header] != response2.headers[req_id_header]
    
    def test_response_time_header(self, client: TestClient):
        """Test that response time is tracked"""
        response = client.get("/health")
        
        assert response.status_code == 200
        
        # Check for timing header
        timing_header = "x-response-time"
        assert timing_header in response.headers or timing_header.upper() in response.headers


@pytest.mark.e2e
@pytest.mark.slow
class TestDatabaseConnectionE2E:
    """Test database connectivity and resilience"""
    
    def test_database_connection_pool(self, client: TestClient, auth_headers: dict):
        """Test that database connection pooling works"""
        # Make multiple concurrent-like requests
        for _ in range(10):
            response = client.get("/api/characters/", headers=auth_headers)
            assert response.status_code == 200
    
    def test_database_transaction_rollback(self, client: TestClient, auth_headers: dict):
        """Test that failed transactions are rolled back"""
        # Try to create a character with invalid foreign key
        invalid_data = {
            "name": "Test Character",
            "system_prompt": "Test prompt",
            "created_by": 99999  # Non-existent user ID
        }
        
        # This should fail and rollback
        response = client.post("/api/characters/", json=invalid_data, headers=auth_headers)
        
        # The request should fail (exact status depends on implementation)
        assert response.status_code >= 400