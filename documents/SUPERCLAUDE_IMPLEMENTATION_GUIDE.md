# SuperClaude 구현 명령어 가이드

이 문서는 캐릭터 선택 서비스를 구현하기 위한 SuperClaude 명령어 가이드입니다.

## 1. 구현 순서 및 권장 명령어

### Phase 1: Backend 수정 (데이터베이스 및 모델)

#### 1.1 Character 모델에 gender 필드 추가
```bash
/sc:implement --backend --seq "Character 모델에 gender 필드를 추가해줘. GenderEnum으로 male, female, other를 지원하고, is_active 필드도 추가해서 현재 선택된 캐릭터를 표시할 수 있도록 해줘."
```

#### 1.2 데이터베이스 마이그레이션
```bash
/sc:implement --backend "Character 테이블에 gender와 is_active 필드를 추가하는 마이그레이션을 생성하고 실행해줘. is_active는 사용자당 하나만 true가 되도록 unique constraint를 추가해줘."
```

#### 1.3 Character Schema 수정
```bash
/sc:implement --backend "Character 관련 Pydantic 스키마에 gender(GenderEnum)와 is_active(bool) 필드를 추가해줘."
```

### Phase 2: Backend API 구현

#### 2.1 캐릭터 선택 API 추가
```bash
/sc:implement --backend --seq "character.py 라우터에 POST /api/characters/{character_id}/select 엔드포인트를 추가해줘. 이 API는 선택한 캐릭터를 활성화하고 나머지는 비활성화해야 해."
```

#### 2.2 활성 캐릭터 조회 API 추가
```bash
/sc:implement --backend "character.py 라우터에 GET /api/characters/active 엔드포인트를 추가해서 현재 활성화된 캐릭터를 반환하도록 해줘."
```

#### 2.3 채팅 서비스 수정 (에코 기능)
```bash
/sc:implement --backend --seq "chat_service.py를 수정해서 Claude API 대신 사용자가 입력한 메시지를 그대로 반환하는 에코 기능으로 변경해줘. 활성 캐릭터가 있을 때만 동작하도록 해줘."
```

### Phase 3: Frontend Store 구현

#### 3.1 Character Store 생성
```bash
/sc:implement --frontend --magic "Pinia를 사용해서 character.ts store를 만들어줘. characters 목록, activeCharacter, fetchCharacters, createCharacter, selectCharacter, deleteCharacter, fetchActiveCharacter 액션이 필요해."
```

### Phase 4: Frontend 컴포넌트 구현

#### 4.1 CharacterSelectionView 생성
```bash
/sc:implement --frontend --magic "CharacterSelectionView.vue를 만들어줘. 캐릭터 목록을 그리드로 보여주고, 캐릭터가 없으면 empty state를 표시해. 새 캐릭터 만들기 버튼도 추가해줘."
```

#### 4.2 CharacterCard 컴포넌트 생성
```bash
/sc:implement --frontend --magic "CharacterCard.vue 컴포넌트를 만들어줘. 캐릭터 이름, 성별, 설명을 표시하고 선택/삭제 버튼이 있어야 해. 활성 상태일 때는 하이라이트 표시해줘."
```

#### 4.3 CharacterCreateModal 컴포넌트 생성
```bash
/sc:implement --frontend --magic "CharacterCreateModal.vue를 만들어줘. 이름(input), 성별(select), 시스템 프롬프트(textarea), 설명(textarea) 필드가 있는 모달이야. Teleport를 사용해서 body에 렌더링해줘."
```

#### 4.4 CharacterDeleteModal 컴포넌트 생성
```bash
/sc:implement --frontend --magic "CharacterDeleteModal.vue를 만들어줘. 삭제 확인 모달로 캐릭터 이름을 표시하고 확인/취소 버튼이 있어야 해."
```

### Phase 5: 라우팅 및 네비게이션 수정

#### 5.1 라우터 설정 업데이트
```bash
/sc:implement --frontend "router/index.ts를 수정해서 /characters 라우트를 추가하고, 로그인 후 /characters로 리다이렉트되도록 해줘. requiresCharacter 메타 필드도 추가해서 캐릭터가 선택되지 않으면 채팅 화면에 접근할 수 없도록 해줘."
```

#### 5.2 네비게이션 가드 수정
```bash
/sc:implement --frontend "라우터의 beforeEach 가드를 수정해서 requiresCharacter가 true인 라우트는 activeCharacter가 있을 때만 접근 가능하도록 해줘."
```

### Phase 6: 통합 및 테스트

#### 6.1 E2E 테스트 작성
```bash
/sc:implement --test --playwright "로그인 → 캐릭터 생성 → 캐릭터 선택 → 채팅 시나리오를 테스트하는 E2E 테스트를 작성해줘."
```

#### 6.2 API 통합 테스트
```bash
/sc:implement --test "캐릭터 CRUD 및 선택 기능에 대한 통합 테스트를 작성해줘."
```

## 2. 유용한 분석 및 검증 명령어

### 코드 분석
```bash
# 현재 구현 상태 분석
/sc:analyze --comprehensive "Character 관련 기능의 현재 구현 상태를 분석하고 누락된 부분을 찾아줘"

# 보안 취약점 분석
/sc:analyze --focus security "캐릭터 선택 기능의 보안 취약점을 분석해줘"
```

### 품질 개선
```bash
# 코드 품질 개선
/sc:improve --quality "CharacterSelectionView와 관련 컴포넌트의 코드 품질을 개선해줘"

# 성능 최적화
/sc:improve --perf "캐릭터 목록 로딩과 선택 기능의 성능을 최적화해줘"
```

### 문서화
```bash
# API 문서 생성
/sc:document "캐릭터 관련 API 엔드포인트의 OpenAPI 문서를 생성해줘"

# 컴포넌트 문서 생성
/sc:document --frontend "CharacterSelectionView와 관련 컴포넌트의 사용법 문서를 작성해줘"
```

## 3. 주의사항 및 팁

### 3.1 순차적 구현
- Backend 수정을 먼저 완료한 후 Frontend를 구현하세요
- 데이터베이스 마이그레이션은 반드시 백업 후 진행하세요

### 3.2 플래그 활용
- `--seq`: 복잡한 로직 구현 시 사용
- `--magic`: UI 컴포넌트 생성 시 사용
- `--c7`: Vue.js 패턴 참조가 필요할 때 사용
- `--validate`: 구현 후 검증이 필요할 때 사용

### 3.3 반복적 개선
```bash
# 구현 후 개선 사이클
/sc:implement [기능 구현] → /sc:analyze [분석] → /sc:improve [개선] → /sc:test [테스트]
```

### 3.4 Wave 모드 활용
대규모 변경이 필요한 경우:
```bash
/sc:implement --wave-mode --systematic "전체 캐릭터 선택 시스템을 구현해줘"
```

## 4. 트러블슈팅

### 일반적인 문제 해결
```bash
# 의존성 문제
/sc:troubleshoot "캐릭터 관련 기능이 작동하지 않는 문제를 분석하고 해결해줘"

# 타입 에러
/sc:analyze --focus types "TypeScript 타입 에러를 찾아서 수정해줘"

# 빌드 에러
/sc:troubleshoot "빌드 에러를 분석하고 해결 방법을 제시해줘"
```

## 5. 구현 체크리스트

- [ ] Backend: Character 모델 수정 (gender, is_active 추가)
- [ ] Backend: 데이터베이스 마이그레이션
- [ ] Backend: Character Schema 수정
- [ ] Backend: 캐릭터 선택 API 구현
- [ ] Backend: 활성 캐릭터 조회 API 구현
- [ ] Backend: 채팅 에코 기능 구현
- [ ] Frontend: Character Store 생성
- [ ] Frontend: CharacterSelectionView 구현
- [ ] Frontend: CharacterCard 컴포넌트 구현
- [ ] Frontend: CharacterCreateModal 구현
- [ ] Frontend: CharacterDeleteModal 구현
- [ ] Frontend: 라우터 설정 수정
- [ ] Frontend: 네비게이션 가드 수정
- [ ] Testing: E2E 테스트 작성
- [ ] Testing: API 통합 테스트 작성
- [ ] Documentation: API 문서 업데이트
- [ ] Documentation: 컴포넌트 사용법 문서 작성