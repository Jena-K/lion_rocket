#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify Swagger/OpenAPI endpoints are working
"""
import requests
import json
import sys

# Set encoding for Windows
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

BASE_URL = "http://localhost:8000"

def test_openapi_endpoints():
    """Test all OpenAPI related endpoints"""
    print("Testing Swagger/OpenAPI endpoints...\n")
    
    # Test 1: Check OpenAPI JSON endpoint
    print("1. Testing OpenAPI JSON endpoint (/openapi.json)...")
    try:
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code == 200:
            openapi_data = response.json()
            print(f"   [OK] Success! OpenAPI version: {openapi_data.get('openapi', 'N/A')}")
            print(f"   [OK] API Title: {openapi_data.get('info', {}).get('title', 'N/A')}")
            print(f"   [OK] API Version: {openapi_data.get('info', {}).get('version', 'N/A')}")
            print(f"   [OK] Number of paths: {len(openapi_data.get('paths', {}))}")
            print(f"   [OK] Number of tags: {len(openapi_data.get('tags', []))}")
        else:
            print(f"   [FAIL] Failed! Status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   [ERROR] Cannot connect to server. Is the server running?")
        print("   [INFO] Start the server with: python -m uvicorn app.main:app --reload")
    except Exception as e:
        print(f"   [ERROR] Error: {str(e)}")
    
    # Test 2: Check Swagger UI endpoint
    print("\n2. Testing Swagger UI endpoint (/docs)...")
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print(f"   [OK] Success! Swagger UI is accessible")
            print(f"   [OK] Content-Type: {response.headers.get('content-type', 'N/A')}")
            if 'swagger-ui' in response.text.lower():
                print("   [OK] Swagger UI HTML detected")
        else:
            print(f"   [FAIL] Failed! Status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   [ERROR] Cannot connect to server. Is the server running?")
        print("   [INFO] Start the server with: python -m uvicorn app.main:app --reload")
    except Exception as e:
        print(f"   [ERROR] Error: {str(e)}")
    
    # Test 3: Check ReDoc endpoint
    print("\n3. Testing ReDoc endpoint (/redoc)...")
    try:
        response = requests.get(f"{BASE_URL}/redoc")
        if response.status_code == 200:
            print(f"   [OK] Success! ReDoc is accessible")
            print(f"   [OK] Content-Type: {response.headers.get('content-type', 'N/A')}")
            if 'redoc' in response.text.lower():
                print("   [OK] ReDoc HTML detected")
        else:
            print(f"   [FAIL] Failed! Status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   [ERROR] Cannot connect to server. Is the server running?")
        print("   [INFO] Start the server with: python -m uvicorn app.main:app --reload")
    except Exception as e:
        print(f"   [ERROR] Error: {str(e)}")
    
    # Test 4: Check root endpoint
    print("\n4. Testing root endpoint (/)...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"   [OK] Success! API is running")
            print(f"   [OK] Message: {data.get('message', 'N/A')}")
            print(f"   [OK] Version: {data.get('version', 'N/A')}")
            print(f"   [OK] Docs URL: {data.get('docs', 'N/A')}")
            print(f"   [OK] ReDoc URL: {data.get('redoc', 'N/A')}")
        else:
            print(f"   [FAIL] Failed! Status code: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   [ERROR] Cannot connect to server. Is the server running?")
        print("   [INFO] Start the server with: python -m uvicorn app.main:app --reload")
    except Exception as e:
        print(f"   [ERROR] Error: {str(e)}")
    
    # Test 5: List available endpoints from OpenAPI
    print("\n5. Available API endpoints:")
    try:
        response = requests.get(f"{BASE_URL}/openapi.json")
        if response.status_code == 200:
            openapi_data = response.json()
            paths = openapi_data.get('paths', {})
            
            # Group by tag
            endpoints_by_tag = {}
            for path, methods in paths.items():
                for method, details in methods.items():
                    if method in ['get', 'post', 'put', 'delete', 'patch']:
                        tags = details.get('tags', ['untagged'])
                        summary = details.get('summary', 'No summary')
                        for tag in tags:
                            if tag not in endpoints_by_tag:
                                endpoints_by_tag[tag] = []
                            endpoints_by_tag[tag].append(f"   {method.upper():6} {path:40} - {summary}")
            
            # Print grouped endpoints
            for tag, endpoints in sorted(endpoints_by_tag.items()):
                print(f"\n   [TAG] {tag.upper()}:")
                for endpoint in sorted(endpoints):
                    print(f"   {endpoint}")
    except Exception as e:
        print(f"   ❌ Error listing endpoints: {str(e)}")
    
    print("\n" + "="*60)
    print("[OK] Swagger/OpenAPI testing complete!")
    print("="*60)
    
    print("\n[INFO] Quick Links:")
    print(f"   - Swagger UI: {BASE_URL}/docs")
    print(f"   - ReDoc: {BASE_URL}/redoc")
    print(f"   - OpenAPI JSON: {BASE_URL}/openapi.json")
    print("\n[TIP] Tip: Open these URLs in your browser to explore the API documentation!")

if __name__ == "__main__":
    test_openapi_endpoints()