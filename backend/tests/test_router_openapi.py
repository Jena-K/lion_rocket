#!/usr/bin/env python
"""Test OpenAPI schema generation for individual routers"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from app.routers import auth, chat, character, prompt, admin
from app.database import get_db

# Test each router individually
routers = [
    ("auth", auth.auth_router),
    ("chat", chat.router),
    ("character", character.router),
    ("prompt", prompt.router),
    ("admin", admin.router),
]

for router_name, router_instance in routers:
    print(f"\n=== Testing {router_name} router ===")
    try:
        # Create a test app with only this router
        test_app = FastAPI()
        test_app.include_router(router_instance)
        
        # Try to generate OpenAPI schema
        schema = test_app.openapi()
        print(f"[OK] {router_name} router OpenAPI schema generated successfully!")
        print(f"  Paths: {len(schema.get('paths', {}))}")
        
    except Exception as e:
        print(f"[FAIL] {router_name} router failed: {type(e).__name__}: {e}")
        # Continue to test other routers

print("\n=== Testing complete app ===")
try:
    from app.main import app
    schema = app.openapi()
    print("[OK] Complete app OpenAPI schema generated successfully!")
    print(f"  Paths: {len(schema.get('paths', {}))}")
except Exception as e:
    print(f"[FAIL] Complete app failed: {type(e).__name__}: {e}")