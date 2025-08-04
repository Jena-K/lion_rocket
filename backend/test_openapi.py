#!/usr/bin/env python
"""Test OpenAPI schema generation"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

try:
    from app.main import app
    
    print("=== Testing OpenAPI Schema Generation ===")
    print("Attempting to generate OpenAPI schema...")
    
    # Try to get the OpenAPI schema
    openapi_schema = app.openapi()
    
    print("✓ OpenAPI schema generated successfully!")
    print(f"Title: {openapi_schema.get('info', {}).get('title')}")
    print(f"Version: {openapi_schema.get('info', {}).get('version')}")
    print(f"Number of paths: {len(openapi_schema.get('paths', {}))}")
    
except Exception as e:
    print(f"✗ Error generating OpenAPI schema: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()