#!/usr/bin/env python3
"""Test script to verify Swagger documentation is working"""

import requests
import json

def test_swagger_endpoints():
    base_url = "http://localhost:8000"
    
    # Test OpenAPI JSON endpoint
    print("Testing OpenAPI JSON endpoint...")
    try:
        response = requests.get(f"{base_url}/openapi.json")
        print(f"OpenAPI JSON Status: {response.status_code}")
        if response.status_code == 200:
            openapi_data = response.json()
            print(f"API Title: {openapi_data.get('info', {}).get('title', 'N/A')}")
            print(f"API Version: {openapi_data.get('info', {}).get('version', 'N/A')}")
            print(f"Number of paths: {len(openapi_data.get('paths', {}))}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error accessing OpenAPI JSON: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test Swagger UI endpoint
    print("Testing Swagger UI endpoint...")
    try:
        response = requests.get(f"{base_url}/docs")
        print(f"Swagger UI Status: {response.status_code}")
        if response.status_code == 200:
            print("Swagger UI is accessible!")
            # Check if it contains swagger-ui elements
            if "swagger-ui" in response.text:
                print("✓ Swagger UI HTML contains expected elements")
            else:
                print("⚠ Swagger UI HTML might be incomplete")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error accessing Swagger UI: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test ReDoc endpoint
    print("Testing ReDoc endpoint...")
    try:
        response = requests.get(f"{base_url}/redoc")
        print(f"ReDoc Status: {response.status_code}")
        if response.status_code == 200:
            print("ReDoc is accessible!")
            if "redoc" in response.text:
                print("✓ ReDoc HTML contains expected elements")
            else:
                print("⚠ ReDoc HTML might be incomplete")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error accessing ReDoc: {e}")

if __name__ == "__main__":
    print("Testing Swagger/OpenAPI Documentation Endpoints\n")
    test_swagger_endpoints()
    print("\n\nIf the server is not running, start it with:")
    print("cd backend && uvicorn app.main:app --reload")