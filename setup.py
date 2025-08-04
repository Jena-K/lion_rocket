#!/usr/bin/env python3
"""
LionRocket Setup Script
Quick setup for assignment submission
"""
import os
import subprocess
import sys
from pathlib import Path

def main():
    print("🚀 LionRocket 과제 설정 스크립트")
    print("=" * 50)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)
    
    print("📦 의존성 설치 중...")
    try:
        # Try uv first, fallback to pip
        try:
            subprocess.run(["uv", "pip", "install", "-r", "requirements.txt"], check=True)
            print("✅ UV로 의존성 설치 완료")
        except (subprocess.CalledProcessError, FileNotFoundError):
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)
            print("✅ pip으로 의존성 설치 완료")
    except subprocess.CalledProcessError:
        print("❌ 의존성 설치 실패")
        return False
    
    print("\n🗄️ 데이터베이스 초기화 중...")
    try:
        subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
        print("✅ 데이터베이스 초기화 완료")
    except subprocess.CalledProcessError:
        print("⚠️ 데이터베이스 마이그레이션 실패 (서버 시작 시 자동 생성됩니다)")
    
    print("\n🎯 설정 완료!")
    print("\n📋 실행 방법:")
    print("  cd backend")
    print("  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("\n🌐 API 문서: http://localhost:8000/docs")
    print("👤 관리자 로그인: admin / admin123")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)