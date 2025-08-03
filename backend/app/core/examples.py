"""
API request and response examples for documentation
"""

# Authentication Examples
AUTH_EXAMPLES = {
    "register_request": {
        "username": "john_doe",
        "email": "john.doe@example.com",
        "password": "SecurePassword123!",
    },
    "register_response": {
        "id": 1,
        "username": "john_doe",
        "email": "john.doe@example.com",
        "is_admin": False,
        "created_at": "2024-01-01T00:00:00",
    },
    "login_response": {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huX2RvZSIsImV4cCI6MTcwNDEzMDgwMH0.AbCdEfGhIjKlMnOpQrStUvWxYz",
        "token_type": "bearer",
        "user": {
            "id": 1,
            "username": "john_doe",
            "email": "john.doe@example.com",
            "is_admin": False,
            "created_at": "2024-01-01T00:00:00",
        },
    },
}

# Chat Examples
CHAT_EXAMPLES = {
    "create_chat_request": {
        "character_id": 1,
        "initial_message": "Hello, I need help with Python programming",
    },
    "chat_response": {
        "id": 1,
        "user_id": 1,
        "character_id": 1,
        "created_at": "2024-01-01T00:00:00",
        "last_message_at": "2024-01-01T00:00:00",
    },
    "chat_with_messages": {
        "id": 1,
        "user_id": 1,
        "character_id": 1,
        "created_at": "2024-01-01T00:00:00",
        "last_message_at": "2024-01-01T00:05:00",
        "character": {
            "id": 1,
            "name": "Code Helper",
            "system_prompt": "You are a helpful programming assistant...",
            "created_by": 1,
            "created_at": "2024-01-01T00:00:00",
        },
        "messages": [
            {
                "id": 1,
                "chat_id": 1,
                "role": "user",
                "content": "Hello, I need help with Python programming",
                "token_count": 10,
                "created_at": "2024-01-01T00:00:00",
            },
            {
                "id": 2,
                "chat_id": 1,
                "role": "assistant",
                "content": "Hello! I'd be happy to help you with Python programming. What specific topic or problem are you working on?",
                "token_count": 20,
                "created_at": "2024-01-01T00:00:01",
            },
        ],
        "message_count": 2,
    },
}

# Message Examples
MESSAGE_EXAMPLES = {
    "send_message_request": {"content": "Can you explain Python decorators?"},
    "message_response": {
        "id": 3,
        "chat_id": 1,
        "role": "assistant",
        "content": "Python decorators are a powerful feature that allows you to modify or enhance functions and classes...",
        "token_count": 150,
        "created_at": "2024-01-01T00:00:30",
    },
}

# Character Examples
CHARACTER_EXAMPLES = {
    "character_create_request": {
        "name": "Math Tutor",
        "system_prompt": "You are a patient and knowledgeable math tutor. Help students understand mathematical concepts with clear explanations and examples.",
    },
    "character_response": {
        "id": 2,
        "name": "Math Tutor",
        "system_prompt": "You are a patient and knowledgeable math tutor. Help students understand mathematical concepts with clear explanations and examples.",
        "created_by": 1,
        "created_at": "2024-01-01T00:00:00",
    },
    "character_with_stats": {
        "id": 1,
        "name": "Code Helper",
        "system_prompt": "You are a programming assistant...",
        "created_by": 1,
        "created_at": "2024-01-01T00:00:00",
        "chat_count": 25,
        "total_messages": 150,
    },
}

# Admin Examples
ADMIN_EXAMPLES = {
    "admin_user_response": {
        "id": 2,
        "username": "jane_smith",
        "email": "jane.smith@example.com",
        "is_admin": False,
        "created_at": "2024-01-01T00:00:00",
        "total_chats": 5,
        "total_tokens": 2500,
        "last_active": "2024-01-02T15:30:00",
    },
    "admin_stats_response": {
        "total_users": 150,
        "active_users_today": 45,
        "total_chats": 1250,
        "total_messages": 8500,
        "total_tokens_used": 125000,
        "average_tokens_per_user": 833.33,
    },
    "usage_stat_response": {
        "id": 1,
        "user_id": 2,
        "usage_date": "2024-01-02",
        "chat_count": 3,
        "total_tokens": 450,
        "created_at": "2024-01-02T00:00:00",
    },
}

# Error Examples
ERROR_EXAMPLES = {
    "validation_error": {
        "detail": [
            {
                "loc": ["body", "password"],
                "msg": "ensure this value has at least 8 characters",
                "type": "value_error.any_str.min_length",
                "ctx": {"limit_value": 8},
            }
        ],
        "status": 422,
    },
    "unauthorized_error": {"detail": "Could not validate credentials", "status": 401},
    "forbidden_error": {"detail": "Not enough permissions", "status": 403},
    "not_found_error": {"detail": "Chat not found", "status": 404},
    "rate_limit_error": {"detail": "Rate limit exceeded: 20 per 1 minute", "status": 429},
}
