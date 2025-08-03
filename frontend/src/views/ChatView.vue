<template>
  <div class="chat-container">
    <header class="chat-header">
      <div class="header-left">
        <h1>LionRocket AI Chat</h1>
      </div>
      <div class="header-right">
        <span class="user-info">{{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="logout-btn">로그아웃</button>
      </div>
    </header>

    <main class="chat-main">
      <div class="welcome-message">
        <h2>안녕하세요! 👋</h2>
        <p>JWT 인증이 성공적으로 구현되었습니다.</p>
        <p>이제 AI와 대화를 시작할 수 있습니다!</p>

        <div class="user-details">
          <h3>사용자 정보</h3>
          <ul>
            <li><strong>사용자명:</strong> {{ authStore.user?.username }}</li>
            <li><strong>이메일:</strong> {{ authStore.user?.email }}</li>
            <li><strong>관리자:</strong> {{ authStore.user?.is_admin ? '예' : '아니오' }}</li>
            <li><strong>가입일:</strong> {{ formatDate(authStore.user?.created_at) }}</li>
          </ul>
        </div>

        <div class="jwt-info">
          <h3>JWT 토큰 정보</h3>
          <p><strong>토큰 존재:</strong> {{ authStore.token ? '✅ 유효' : '❌ 없음' }}</p>
          <p>
            <strong>인증 상태:</strong> {{ authStore.isAuthenticated ? '✅ 인증됨' : '❌ 미인증' }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '알 수 없음'
  return new Date(dateString).toLocaleDateString('ko-KR')
}
</script>

<style scoped>
.chat-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: white;
  border-bottom: 1px solid #eee;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left h1 {
  color: #333;
  margin: 0;
  font-size: 1.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  color: #666;
  font-weight: 500;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background: #c82333;
}

.chat-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #f8f9fa;
}

.welcome-message {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  text-align: center;
}

.welcome-message h2 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 2rem;
}

.welcome-message p {
  color: #666;
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.user-details,
.jwt-info {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.user-details h3,
.jwt-info h3 {
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
}

.user-details ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-details li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.user-details li:last-child {
  border-bottom: none;
}

.jwt-info p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .chat-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .welcome-message {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>
