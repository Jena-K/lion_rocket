 # Node.js 공식 이미지 사용
  FROM node:18-alpine

  # 작업 디렉토리 설정
  WORKDIR /app

  # package.json과 package-lock.json 복사
  COPY package*.json ./

  # 의존성 설치
  RUN npm ci

  # 소스 코드 복사
  COPY . .

  # Vite 개발 서버 포트 노출
  EXPOSE 5173

  # 개발 서버 실행
  CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]