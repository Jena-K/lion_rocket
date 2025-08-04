#!/usr/bin/env python3
"""
Avatar Image API 엔드포인트 테스트 스크립트
새로운 /images/avatars/{avatar_url} 엔드포인트 테스트
"""

import asyncio
import sys
from pathlib import Path
import requests
import os

# 프로젝트 루트를 Python path에 추가
sys.path.append(str(Path(__file__).parent))

def test_avatar_endpoint():
    """Avatar 이미지 API 엔드포인트 테스트"""
    
    base_url = "http://localhost:8000"
    
    print("=" * 60)
    print("🖼️  Avatar 이미지 API 엔드포인트 테스트")
    print("=" * 60)
    
    # 새로운 /images/avatar/{parameter} 엔드포인트 테스트
    print("\n📌 새로운 엔드포인트 테스트: /images/avatar/{parameter}")
    print("-" * 40)
    
    new_test_cases = [
        {
            "name": "유효한 기존 avatar (1_20250804215023)",
            "parameter": "1_20250804215023",
            "expected_status": [200]
        },
        {
            "name": "유효한 기존 avatar (2_20250804215023)",
            "parameter": "2_20250804215023",
            "expected_status": [200]
        },
        {
            "name": "존재하지 않는 avatar",
            "parameter": "nonexistent",
            "expected_status": [404]
        },
        {
            "name": "Path traversal 시도",
            "parameter": "../../../etc/passwd",
            "expected_status": [400]
        },
        {
            "name": "특수문자 포함",
            "parameter": "test@invalid",
            "expected_status": [400]
        },
        {
            "name": "공백 포함",
            "parameter": "test space",
            "expected_status": [400]
        }
    ]
    
    for i, test_case in enumerate(new_test_cases, 1):
        print(f"\n테스트 {i}: {test_case['name']}")
        print(f"  URL: /images/avatar/{test_case['parameter']}")
        
        try:
            response = requests.get(f"{base_url}/images/avatar/{test_case['parameter']}")
            status_code = response.status_code
            
            if status_code in test_case['expected_status']:
                print(f"  ✅ 결과: {status_code} (예상됨)")
                
                if status_code == 200:
                    content_type = response.headers.get('Content-Type', 'Unknown')
                    content_length = response.headers.get('Content-Length', 'Unknown')
                    cache_control = response.headers.get('Cache-Control', 'Unknown')
                    cors_origin = response.headers.get('Access-Control-Allow-Origin', 'Unknown')
                    
                    print(f"     Content-Type: {content_type}")
                    print(f"     Content-Length: {content_length}")
                    print(f"     Cache-Control: {cache_control}")
                    print(f"     CORS Origin: {cors_origin}")
            else:
                print(f"  ❌ 결과: {status_code} (예상: {test_case['expected_status']})")
                print(f"     응답: {response.text[:100]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"  ❌ 연결 실패: 서버가 실행중인지 확인하세요")
            print(f"     서버 시작: uvicorn app.main:app --reload")
        except Exception as e:
            print(f"  ❌ 오류: {e}")
    
    # 기존 엔드포인트도 테스트
    print("\n\n📌 기존 엔드포인트 테스트: /images/avatars/{avatar_url}")
    print("-" * 40)
    
    # 테스트 케이스들
    test_cases = [
        {
            "name": "유효한 avatar_url",
            "avatar_url": "1_202501041625",
            "expected_status": [200, 404]  # 파일이 있으면 200, 없으면 404
        },
        {
            "name": "잘못된 형식 - 숫자 없음",
            "avatar_url": "invalid_format",
            "expected_status": [400]
        },
        {
            "name": "잘못된 형식 - 타임스탬프 길이",
            "avatar_url": "1_20250104",
            "expected_status": [400]
        },
        {
            "name": "Path traversal 시도",
            "avatar_url": "../../../etc/passwd",
            "expected_status": [400]
        },
        {
            "name": "Path traversal 시도 2",
            "avatar_url": "1_202501041625/../secret",
            "expected_status": [400]
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n테스트 {i}: {test_case['name']}")
        print(f"  URL: /images/avatars/{test_case['avatar_url']}")
        
        try:
            response = requests.get(f"{base_url}/images/avatars/{test_case['avatar_url']}")
            status_code = response.status_code
            
            if status_code in test_case['expected_status']:
                print(f"  ✅ 결과: {status_code} (예상됨)")
                
                if status_code == 200:
                    content_type = response.headers.get('Content-Type', 'Unknown')
                    content_length = response.headers.get('Content-Length', 'Unknown')
                    cache_control = response.headers.get('Cache-Control', 'Unknown')
                    
                    print(f"     Content-Type: {content_type}")
                    print(f"     Content-Length: {content_length}")
                    print(f"     Cache-Control: {cache_control}")
                    
            else:
                print(f"  ❌ 결과: {status_code} (예상: {test_case['expected_status']})")
                print(f"     응답: {response.text[:100]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"  ❌ 연결 실패: 서버가 실행중인지 확인하세요")
        except Exception as e:
            print(f"  ❌ 오류: {e}")
        
        print()

def check_uploads_directory():
    """업로드 디렉토리 존재 여부 확인"""
    print("📁 업로드 디렉토리 확인:")
    
    uploads_dir = Path("app/uploads/avatars")
    
    if uploads_dir.exists():
        print(f"  ✅ 디렉토리 존재: {uploads_dir.absolute()}")
        
        # 디렉토리 내 파일 목록
        png_files = list(uploads_dir.glob("*.png"))
        if png_files:
            print(f"  📁 PNG 파일 {len(png_files)}개 발견:")
            for png_file in png_files[:5]:  # 최대 5개까지만 표시
                print(f"     - {png_file.name}")
            if len(png_files) > 5:
                print(f"     ... 외 {len(png_files) - 5}개")
        else:
            print("  📁 PNG 파일이 없습니다")
    else:
        print(f"  ❌ 디렉토리 없음: {uploads_dir.absolute()}")
        print("  💡 디렉토리를 생성하거나 테스트 이미지를 추가하세요")

def create_test_image():
    """테스트용 이미지 파일 생성"""
    print("\n🎨 테스트 이미지 생성:")
    
    uploads_dir = Path("app/uploads/avatars")
    uploads_dir.mkdir(parents=True, exist_ok=True)
    
    test_filename = "1_202501041625.png"
    test_path = uploads_dir / test_filename
    
    if not test_path.exists():
        try:
            # 간단한 1x1 PNG 이미지 생성 (Base64)
            import base64
            
            # 1x1 투명 PNG 이미지 데이터
            png_data = base64.b64decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU8A6gAAAABJRU5ErkJggg=="
            )
            
            with open(test_path, 'wb') as f:
                f.write(png_data)
            
            print(f"  ✅ 테스트 이미지 생성: {test_filename}")
            return True
            
        except Exception as e:
            print(f"  ❌ 이미지 생성 실패: {e}")
            return False
    else:
        print(f"  ✅ 테스트 이미지 이미 존재: {test_filename}")
        return True

def main():
    """메인 실행 함수"""
    check_uploads_directory()
    create_test_image()
    test_avatar_endpoint()
    
    print("=" * 60)
    print("💡 API 사용법:")
    print("   새로운 엔드포인트: GET http://localhost:8000/images/avatar/{parameter}")
    print("   예시: http://localhost:8000/images/avatar/1_20250804215023")
    print("")
    print("   기존 엔드포인트: GET http://localhost:8000/images/avatars/{character_id}_{YYYYMMDDmmSS}")
    print("   예시: http://localhost:8000/images/avatars/1_202501041625")
    print("=" * 60)

if __name__ == "__main__":
    main()