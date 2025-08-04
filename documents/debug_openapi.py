#!/usr/bin/env python3
"""Debug script to test OpenAPI generation"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
import json

def test_openapi_generation():
    """Test OpenAPI schema generation directly"""
    print("Testing OpenAPI schema generation...\n")
    
    try:
        # Try to get the OpenAPI schema
        schema = app.openapi()
        print("✓ OpenAPI schema generated successfully!")
        print(f"API Title: {schema.get('info', {}).get('title', 'N/A')}")
        print(f"API Version: {schema.get('info', {}).get('version', 'N/A')}")
        print(f"Number of paths: {len(schema.get('paths', {}))}")
        
        # Save to file for inspection
        with open('openapi_debug.json', 'w') as f:
            json.dump(schema, f, indent=2)
        print("\nSchema saved to openapi_debug.json")
        
    except Exception as e:
        print(f"✗ Error generating OpenAPI schema:")
        print(f"  Type: {type(e).__name__}")
        print(f"  Message: {str(e)}")
        
        # Print full traceback
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        
        # Try to identify common issues
        print("\n" + "="*50)
        print("Common issues to check:")
        print("1. Circular imports in routers")
        print("2. Missing dependencies in Pydantic models")
        print("3. Invalid response_model in endpoints")
        print("4. Syntax errors in endpoint decorators")

if __name__ == "__main__":
    test_openapi_generation()