#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Claude AI API 직접 통신 테스트 스크립트
웹서비스와 독립적으로 Claude API가 작동하는지 확인합니다.
"""

import os
import sys
import asyncio
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

# Windows 환경에서 UTF-8 인코딩 설정
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# .env 파일 로드
load_dotenv()

async def test_claude_api():
    """Claude API와 직접 통신하는 테스트"""
    
    # 1. API 키 확인
    api_key = "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"
    
    if not api_key:
        print("❌ 오류: CLAUDE_API_KEY가 .env 파일에 설정되지 않았습니다.")
        print("\n📝 해결 방법:")
        print("1. backend/.env 파일을 열어주세요")
        print("2. 다음 라인을 추가하세요: CLAUDE_API_KEY=your-api-key-here")
        print("3. 'your-api-key-here'를 실제 Claude API 키로 교체하세요")
        return
    
    print(f"✅ API 키 발견: {api_key[:20]}...")
    
    # 2. Claude 클라이언트 생성
    try:
        client = AsyncAnthropic(api_key=api_key)
        print("✅ Claude 클라이언트 생성 성공")
    except Exception as e:
        print(f"❌ 클라이언트 생성 실패: {e}")
        return
    
    # 3. 간단한 메시지 테스트
    print("\n🤖 Claude API 테스트 시작...")
    print("-" * 50)
    
    test_message = "안녕하세요! 당신은 Claude AI가 맞나요? 간단히 자기소개를 해주세요."
    print(f"📤 보낸 메시지: {test_message}")
    print("-" * 50)
    
    try:
        # Claude API 호출
        response = await client.messages.create(
            model="claude-3-sonnet", 
            max_tokens=200,
            messages=[{
                "role": "user",
                "content": test_message
            }],
            system="당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 한국어로 대답해주세요."
        )
        
        # 응답 출력
        print("📥 Claude 응답:")
        print(response.content[0].text)
        print("-" * 50)
        
        # 토큰 사용량 확인
        print(f"\n📊 사용 통계:")
        print(f"   - 모델: {response.model}")
        print(f"   - 입력 토큰: {response.usage.input_tokens}")
        print(f"   - 출력 토큰: {response.usage.output_tokens}")
        print(f"   - 총 토큰: {response.usage.input_tokens + response.usage.output_tokens}")
        
        print("\n✅ Claude API 테스트 성공!")
        
    except Exception as e:
        print(f"\n❌ API 호출 실패: {e}")
        print("\n가능한 원인:")
        print("1. API 키가 올바르지 않음")
        print("2. API 크레딧이 부족함")
        print("3. 네트워크 연결 문제")
        print("4. Claude API 서비스 문제")
    
    # 대화형 테스트는 크레딧이 충분할 때만 활성화
    # print("\n" + "="*50)
    # print("💬 대화형 테스트를 시작하시겠습니까? (y/n): ", end="")
    # answer = input().strip().lower()
    # if answer == 'y':
    #     await interactive_test(client)

async def interactive_test(client: AsyncAnthropic):
    """대화형 Claude API 테스트"""
    print("\n🎯 대화형 테스트 모드")
    print("종료하려면 'quit' 또는 'exit'를 입력하세요.")
    print("-" * 50)
    
    conversation = []  # 대화 기록 저장
    
    while True:
        print("\n당신: ", end="")
        user_input = input().strip()
        
        if user_input.lower() in ['quit', 'exit', '종료']:
            print("👋 대화를 종료합니다.")
            break
        
        if not user_input:
            continue
        
        # 대화 기록에 추가
        conversation.append({"role": "user", "content": user_input})
        
        try:
            # Claude API 호출 (대화 컨텍스트 포함)
            response = await client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                messages=conversation,
                system="당신은 친절하고 도움이 되는 AI 어시스턴트입니다. 자연스러운 한국어로 대화해주세요."
            )
            
            ai_response = response.content[0].text
            print(f"\nClaude: {ai_response}")
            
            # AI 응답도 대화 기록에 추가
            conversation.append({"role": "assistant", "content": ai_response})
            
            # 토큰 사용량 표시
            total_tokens = response.usage.input_tokens + response.usage.output_tokens
            print(f"\n(토큰 사용: {total_tokens})")
            
        except Exception as e:
            print(f"\n❌ 오류 발생: {e}")
            break

def main():
    """메인 함수"""
    print("🚀 Claude AI API 직접 통신 테스트")
    print("=" * 50)
    
    # 현재 환경 정보 출력
    print("📁 현재 디렉토리:", os.getcwd())
    print("📄 .env 파일 위치:", os.path.join(os.getcwd(), '.env'))
    
    # 비동기 테스트 실행
    asyncio.run(test_claude_api())

if __name__ == "__main__":
    main()