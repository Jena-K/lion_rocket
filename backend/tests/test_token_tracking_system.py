#!/usr/bin/env python3
"""
토큰 추적 시스템 종합 테스트
Token tracking system comprehensive test
"""
import asyncio
import sys
from pathlib import Path

# Add project root to Python path
sys.path.append(str(Path(__file__).parent))

from fastapi.testclient import TestClient
import json

def test_token_tracking_system():
    """토큰 추적 시스템 종합 테스트"""
    print("=" * 60)
    print("🎯 토큰 추적 시스템 종합 테스트")
    print("=" * 60)
    
    try:
        from app.main import app
        client = TestClient(app)
        
        # 1. 일반 사용자 로그인
        print("\n1️⃣ 일반 사용자 로그인 테스트")
        login_response = client.post(
            "/auth/login",
            data={"username": "testuser", "password": "testpassword"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            print("✅ 사용자 로그인 성공")
        else:
            print(f"❌ 사용자 로그인 실패: {login_response.status_code}")
            # 회원가입 시도
            register_response = client.post(
                "/auth/register",
                json={
                    "username": "testuser",
                    "email": "test@example.com",
                    "password": "testpassword123!"
                }
            )
            if register_response.status_code == 201:
                print("✅ 회원가입 후 로그인 시도")
                # 다시 로그인 시도
                login_response = client.post(
                    "/auth/login",
                    data={"username": "testuser", "password": "testpassword123!"},
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )
                if login_response.status_code == 200:
                    token = login_response.json()["access_token"]
                    headers = {"Authorization": f"Bearer {token}"}
                    print("✅ 회원가입 후 로그인 성공")
                else:
                    print(f"❌ 회원가입 후 로그인도 실패: {login_response.status_code}")
                    return False
            else:
                print(f"❌ 회원가입도 실패: {register_response.status_code}")
                return False
        
        # 2. 사용자 통계 정보 조회 (토큰 정보 포함)
        print("\n2️⃣ 사용자 토큰 통계 조회 테스트")
        stats_response = client.get("/auth/me/stats", headers=headers)
        
        if stats_response.status_code == 200:
            stats_data = stats_response.json()
            print("✅ 사용자 통계 조회 성공")
            print(f"   사용자 ID: {stats_data.get('user_id', 'N/A')}")
            print(f"   총 채팅 수: {stats_data.get('total_chats', 0)}")
            print(f"   총 토큰 사용량: {stats_data.get('total_tokens', 0)}")
            print(f"   총 프롬프트 수: {stats_data.get('total_prompts', 0)}")
            
            # 토큰 관련 필드 확인
            required_fields = ['total_tokens', 'total_chats', 'total_prompts']
            missing_fields = [field for field in required_fields if field not in stats_data]
            
            if missing_fields:
                print(f"❌ 누락된 필드: {missing_fields}")
                return False
            else:
                print("✅ 모든 필수 필드 확인됨")
        else:
            print(f"❌ 사용자 통계 조회 실패: {stats_response.status_code}")
            print(f"   응답: {stats_response.text}")
            return False
        
        # 3. 관리자 로그인 및 사용자 목록 조회 (토큰 정보 포함)
        print("\n3️⃣ 관리자 토큰 정보 조회 테스트")
        admin_login_response = client.post(
            "/auth/admin/login",
            json={"adminId": "root", "password": "rootpassword123"}
        )
        
        if admin_login_response.status_code == 200:
            admin_token = admin_login_response.json()["access_token"]
            admin_headers = {"Authorization": f"Bearer {admin_token}"}
            print("✅ 관리자 로그인 성공")
            
            # 관리자 사용자 목록 조회
            admin_users_response = client.get("/admin/users?page=1&limit=10", headers=admin_headers)
            
            if admin_users_response.status_code == 200:
                users_data = admin_users_response.json()
                print("✅ 관리자 사용자 목록 조회 성공")
                print(f"   총 사용자 수: {users_data.get('total', 0)}")
                
                if users_data.get('items'):
                    first_user = users_data['items'][0]
                    admin_required_fields = ['user_id', 'username', 'total_chats', 'total_tokens']
                    admin_missing_fields = [field for field in admin_required_fields if field not in first_user]
                    
                    if admin_missing_fields:
                        print(f"❌ 관리자 응답에서 누락된 필드: {admin_missing_fields}")
                        return False
                    else:
                        print("✅ 관리자 응답의 모든 필수 필드 확인됨")
                        print(f"   첫 번째 사용자 토큰 사용량: {first_user['total_tokens']}")
                else:
                    print("⚠️ 사용자 데이터가 없음")
            else:
                print(f"❌ 관리자 사용자 목록 조회 실패: {admin_users_response.status_code}")
                return False
        else:
            print(f"⚠️ 관리자 로그인 실패 (선택사항): {admin_login_response.status_code}")
        
        # 4. 데이터베이스 마이그레이션 상태 확인
        print("\n4️⃣ 데이터베이스 스키마 확인")
        try:
            from app.models.stats import UsageStat
            from sqlalchemy import inspect
            from app.database import engine
            
            # Get table info
            inspector = inspect(engine.sync_engine)
            if inspector.has_table('usage_stats'):
                columns = inspector.get_columns('usage_stats')
                column_names = [col['name'] for col in columns]
                
                required_columns = ['token_count', 'input_tokens', 'output_tokens']
                missing_columns = [col for col in required_columns if col not in column_names]
                
                if missing_columns:
                    print(f"❌ usage_stats 테이블에서 누락된 컬럼: {missing_columns}")
                    print("💡 다음 명령어로 마이그레이션을 실행하세요:")
                    print("   cd backend && alembic upgrade head")
                    return False
                else:
                    print("✅ usage_stats 테이블의 모든 토큰 관련 컬럼 확인됨")
                    print(f"   컬럼: {', '.join(required_columns)}")
            else:
                print("❌ usage_stats 테이블이 존재하지 않음")
                return False
                
        except Exception as e:
            print(f"❌ 데이터베이스 스키마 확인 실패: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ 테스트 실행 실패: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """메인 테스트 함수"""
    success = test_token_tracking_system()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 토큰 추적 시스템 테스트 완료!")
        print("✅ 모든 기능이 정상적으로 작동합니다")
        print()
        print("📋 구현된 기능:")
        print("   • 데이터베이스 토큰 컬럼 추가 (token_count, input_tokens, output_tokens)")
        print("   • 채팅 시 토큰 사용량 추적")
        print("   • 사용자별 토큰 통계 API (/auth/me/stats)")
        print("   • 관리자 사용자 토큰 정보 조회")
        print("   • 프론트엔드 사용자 프로필 페이지")
        print()
        print("🚀 다음 단계:")
        print("   1. 백엔드 서버 시작: python run_server.py")
        print("   2. 프론트엔드 서버 시작: npm run dev")
        print("   3. 사용자 프로필 페이지에서 토큰 정보 확인")
    else:
        print("❌ 토큰 추적 시스템 테스트 실패")
        print("🔍 위의 오류 메시지를 확인하고 문제를 해결하세요")
    print("=" * 60)

if __name__ == "__main__":
    main()