from typing import Any, Dict, Optional
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.core.config import SECURITY_SCHEMES, RESPONSE_EXAMPLES


def custom_openapi(app: FastAPI) -> Dict[str, Any]:
    """
    Custom OpenAPI schema generation with enhanced documentation
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=app.openapi_tags,
        servers=app.servers,
        terms_of_service=app.terms_of_service,
        contact=app.contact,
        license_info=app.license_info,
    )

    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = SECURITY_SCHEMES

    # Add global security requirement
    openapi_schema["security"] = [{"bearerAuth": []}]

    # Add response examples to components
    if "responses" not in openapi_schema["components"]:
        openapi_schema["components"]["responses"] = {}

    openapi_schema["components"]["responses"].update(RESPONSE_EXAMPLES)

    # Enhance path documentation
    for path, methods in openapi_schema["paths"].items():
        for method, operation in methods.items():
            if method in ["get", "post", "put", "delete", "patch"]:
                # Add common responses if not present
                if "responses" not in operation:
                    operation["responses"] = {}

                # Add common error responses
                if path != "/auth/login" and path != "/auth/register":
                    if "401" not in operation["responses"]:
                        operation["responses"]["401"] = {"$ref": "#/components/responses/401"}

                if path.startswith("/admin"):
                    if "403" not in operation["responses"]:
                        operation["responses"]["403"] = {"$ref": "#/components/responses/403"}

                if method in ["get", "put", "delete"] and "{" in path:
                    if "404" not in operation["responses"]:
                        operation["responses"]["404"] = {"$ref": "#/components/responses/404"}

                if method in ["post", "put", "patch"]:
                    if "422" not in operation["responses"]:
                        operation["responses"]["422"] = {"$ref": "#/components/responses/422"}

                # Add rate limit response for chat endpoints
                if "/messages" in path and method == "post":
                    if "429" not in operation["responses"]:
                        operation["responses"]["429"] = {"$ref": "#/components/responses/429"}

    # Add example requests for specific endpoints
    enhance_endpoint_examples(openapi_schema)

    app.openapi_schema = openapi_schema
    return app.openapi_schema


def enhance_endpoint_examples(schema: Dict[str, Any]) -> None:
    """
    Add detailed examples for specific endpoints
    """
    examples = {
        "/auth/register": {
            "post": {
                "requestBody": {
                    "content": {
                        "application/json": {
                            "examples": {
                                "valid_user": {
                                    "summary": "Valid user registration",
                                    "value": {
                                        "username": "john_doe",
                                        "email": "john.doe@example.com",
                                        "password": "SecurePassword123!",
                                    },
                                }
                            }
                        }
                    }
                }
            }
        },
        "/auth/login": {
            "post": {
                "requestBody": {
                    "content": {
                        "application/x-www-form-urlencoded": {
                            "examples": {
                                "valid_login": {
                                    "summary": "Valid login credentials",
                                    "value": {
                                        "username": "john_doe",
                                        "password": "SecurePassword123!",
                                    },
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/chats": {
            "post": {
                "requestBody": {
                    "content": {
                        "application/json": {
                            "examples": {
                                "new_chat": {
                                    "summary": "Create new chat",
                                    "value": {"character_id": 1},
                                },
                                "chat_with_message": {
                                    "summary": "Create chat with initial message",
                                    "value": {
                                        "character_id": 1,
                                        "initial_message": "Hello, Claude!",
                                    },
                                },
                            }
                        }
                    }
                }
            }
        },
        "/api/chats/{chat_id}/messages": {
            "post": {
                "requestBody": {
                    "content": {
                        "application/json": {
                            "examples": {
                                "send_message": {
                                    "summary": "Send a message",
                                    "value": {
                                        "content": "Can you help me understand Python decorators?"
                                    },
                                }
                            }
                        }
                    }
                }
            }
        },
    }

    # Apply examples to schema
    for path, methods in examples.items():
        if path in schema["paths"]:
            for method, content in methods.items():
                if method in schema["paths"][path]:
                    schema["paths"][path][method].update(content)
