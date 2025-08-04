<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-title">
          <img src="/lion_rocket_logo.png" alt="LionRocket" class="logo" />
          <h1>LionRocket AI Chat</h1>
        </div>
        <p>로그인하여 AI와 대화를 시작하세요</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">사용자명</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            required
            :disabled="isLoading"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            :disabled="isLoading"
            autocomplete="current-password"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading">로그인 중...</span>
          <span v-else>로그인</span>
        </button>
      </form>

      <div class="login-footer">
        <p>
          계정이 없으신가요?
          <router-link to="/register">회원가입</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')

const credentials = reactive({
  username: '',
  password: '',
})

const handleLogin = async () => {
  if (isLoading.value) return

  errorMessage.value = ''
  isLoading.value = true

  try {
    await authStore.login(credentials)
    router.push('/characters')
  } catch (error: any) {
    errorMessage.value = error.message || '로그인에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(184, 238, 162, 0.1) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo {
  height: 40px;
  width: auto;
}

.login-header h1 {
  color: #1F2937;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.login-header p {
  color: #6B7280;
  margin: 0;
  font-size: 0.95rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #F9FAFB;
}

.form-group input:focus {
  outline: none;
  border-color: #B8EEA2;
  box-shadow: 0 0 0 3px rgba(184, 238, 162, 0.15);
  background: white;
}

.error-message {
  background: #FEE2E2;
  color: #DC2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  border: 1px solid #FECACA;
}

.login-button {
  width: 100%;
  background: #5A8F47;
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(90, 143, 71, 0.25);
}

.login-button:hover:not(:disabled) {
  background: #4A7C3C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(90, 143, 71, 0.35);
}

.login-button:focus {
  background: #3D6630;
  box-shadow: 0 0 0 3px rgba(184, 238, 162, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.login-footer {
  text-align: center;
}

.login-footer p {
  color: #6B7280;
  font-size: 0.875rem;
}

.login-footer a {
  color: #5A8F47;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.login-footer a:hover {
  color: #4A7C3C;
  text-decoration: underline;
}
</style>
