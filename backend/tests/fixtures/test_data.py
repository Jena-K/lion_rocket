"""
Test data fixtures for E2E tests
"""

# Sample user data
SAMPLE_USERS = [
    {
        "username": "alice",
        "email": "alice@example.com",
        "password": "alice123456"
    },
    {
        "username": "bob",
        "email": "bob@example.com",
        "password": "bob123456"
    }
]

# Sample character data
SAMPLE_CHARACTERS = [
    {
        "name": "Helpful Assistant",
        "system_prompt": "You are a helpful AI assistant that provides clear and concise answers.",
        "description": "A general-purpose assistant for everyday tasks."
    },
    {
        "name": "Code Expert",
        "system_prompt": "You are an expert programmer who helps with coding questions and debugging.",
        "description": "Specialized in software development and programming."
    },
    {
        "name": "Creative Writer",
        "system_prompt": "You are a creative writer who helps with storytelling and creative content.",
        "description": "Expert in creative writing and storytelling."
    }
]

# Sample prompt templates
SAMPLE_PROMPTS = [
    {
        "name": "Code Review",
        "content": "Please review the following code:\n\n{code}\n\nProvide feedback on:\n1. Code quality\n2. Potential bugs\n3. Performance improvements",
        "variables": ["code"]
    },
    {
        "name": "Email Draft",
        "content": "Write a professional email about {topic} to {recipient}. The tone should be {tone}.",
        "variables": ["topic", "recipient", "tone"]
    },
    {
        "name": "Summary",
        "content": "Summarize the following text in {length} sentences:\n\n{text}",
        "variables": ["length", "text"]
    }
]

# Sample chat messages
SAMPLE_MESSAGES = [
    "Hello, can you help me with Python?",
    "What's the difference between a list and a tuple?",
    "Can you write a function to calculate fibonacci numbers?",
    "How do I handle errors in Python?",
    "What are decorators and how do they work?"
]

# Invalid data for negative testing
INVALID_USER_DATA = {
    "short_username": {
        "username": "ab",  # Too short
        "email": "test@example.com",
        "password": "password123"
    },
    "invalid_email": {
        "username": "testuser",
        "email": "not-an-email",  # Invalid format
        "password": "password123"
    },
    "weak_password": {
        "username": "testuser",
        "email": "test@example.com",
        "password": "123"  # Too weak
    }
}

# API error messages to verify
EXPECTED_ERROR_MESSAGES = {
    "unauthorized": "Could not validate credentials",
    "forbidden": "Not enough permissions",
    "not_found": "Not found",
    "validation_error": "Validation error",
    "rate_limit": "Rate limit exceeded"
}