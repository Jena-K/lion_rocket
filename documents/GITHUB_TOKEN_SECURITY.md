# GitHub Personal Access Token 보안 관리 가이드

## 🚨 중요 보안 원칙

### 절대 하지 말아야 할 것들
1. **코드에 직접 포함 금지**
   ```python
   # ❌ 절대 이렇게 하지 마세요
   token = "github_pat_11AMAZL2A08RokFpsxelPQ..."
   ```

2. **공개 저장소에 커밋 금지**
   - `.env` 파일은 반드시 `.gitignore`에 추가
   - 실수로 커밋한 경우 즉시 토큰 폐기 및 재발급

3. **채팅이나 메시지에 공유 금지**
   - 이메일, Slack, Discord 등에 절대 붙여넣지 않기

## ✅ 올바른 토큰 관리 방법

### 1. 환경변수 사용
```bash
# .env 파일 (절대 커밋하지 않음)
GITHUB_TOKEN=your_token_here

# Python에서 사용
import os
token = os.getenv('GITHUB_TOKEN')
```

### 2. Git Credential Manager 사용
```bash
# Windows
git config --global credential.helper manager-core

# macOS
git config --global credential.helper osxkeychain

# Linux
git config --global credential.helper store
```

### 3. 보안 저장소 활용
- **1Password, LastPass, Bitwarden** 등 패스워드 매니저
- **AWS Secrets Manager, Azure Key Vault** (클라우드)
- **GitHub Secrets** (GitHub Actions용)

### 4. SSH 키 사용 (권장)
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your_email@example.com"

# GitHub에 공개 키 추가
cat ~/.ssh/id_ed25519.pub
# GitHub Settings → SSH and GPG keys → New SSH key

# Remote URL을 SSH로 변경
git remote set-url origin git@github.com:username/repo.git
```

## 📋 토큰 관리 체크리스트

### 생성 시
- [ ] 최소 권한 원칙 적용 (필요한 권한만 부여)
- [ ] 만료 기간 설정 (90일 권장)
- [ ] 용도별로 별도 토큰 생성
- [ ] 토큰 이름에 용도 명시

### 사용 시
- [ ] 환경변수 또는 보안 저장소 사용
- [ ] `.gitignore`에 환경 파일 추가 확인
- [ ] 코드 리뷰 시 토큰 노출 확인

### 관리 시
- [ ] 정기적으로 사용하지 않는 토큰 삭제
- [ ] 만료 전 토큰 갱신
- [ ] 의심스러운 활동 시 즉시 폐기

## 🔐 토큰 권한 가이드

### 일반 개발용
```
✅ repo (전체)
✅ workflow (GitHub Actions 사용 시)
❌ admin:org (불필요)
❌ delete_repo (위험)
```

### CI/CD용
```
✅ repo
✅ workflow
✅ write:packages (패키지 배포 시)
```

## 🚑 토큰 노출 시 대응

1. **즉시 토큰 폐기**
   - GitHub → Settings → Developer settings → Personal access tokens
   - 해당 토큰 찾아서 "Delete" 클릭

2. **새 토큰 발급**
   - 동일한 권한으로 새 토큰 생성
   - 모든 사용처 업데이트

3. **보안 점검**
   - 저장소 히스토리 확인
   - 의심스러운 커밋이나 액세스 확인
   - 필요시 `git filter-branch` 또는 BFG Repo-Cleaner 사용

## 💡 추가 보안 팁

### GitHub CLI 사용
```bash
# GitHub CLI 설치 후
gh auth login
# 브라우저를 통한 안전한 인증
```

### 토큰 없이 HTTPS 사용
```bash
# Git 2.11 이상
git config --global credential.helper manager
# 첫 푸시 시 브라우저 인증
```

### 회사/팀 프로젝트
- GitHub Apps 사용 권장
- Organization의 SAML SSO 활용
- Fine-grained personal access tokens 사용

## 📚 참고 자료
- [GitHub Docs: Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub Docs: About authentication to GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github)
- [Git Credential Storage](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)