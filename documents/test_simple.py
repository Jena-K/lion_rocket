#!/usr/bin/env python3
"""Simple test to check FastAPI configuration"""

import sys
print("Python version:", sys.version)

try:
    from fastapi import FastAPI
    print("[OK] FastAPI imported successfully")
except ImportError as e:
    print("[FAIL] FastAPI import failed:", e)

try:
    import pydantic
    print(f"[OK] Pydantic version: {pydantic.VERSION}")
except ImportError as e:
    print("[FAIL] Pydantic import failed:", e)

try:
    from jose import jwt
    print("[OK] python-jose imported successfully")
except ImportError as e:
    print("[FAIL] python-jose import failed:", e)
    print("  Run: pip install python-jose[cryptography]")

try:
    from pydantic_settings import BaseSettings
    print("[OK] BaseSettings from pydantic-settings (Pydantic v2)")
except ImportError as e:
    print("[FAIL] BaseSettings import failed:", e)
    print("  Run: pip install pydantic-settings")

# Test creating a minimal FastAPI app
try:
    app = FastAPI(
        title="Test API",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )
    
    @app.get("/")
    def read_root():
        return {"message": "Hello World"}
    
    # Try to get OpenAPI schema
    schema = app.openapi()
    print("[OK] Basic FastAPI app with OpenAPI works!")
    print(f"  Title: {schema.get('info', {}).get('title')}")
    print(f"  Paths: {list(schema.get('paths', {}).keys())}")
    
except Exception as e:
    print("[FAIL] FastAPI app creation failed:", e)
    import traceback
    traceback.print_exc()