<template>
  <div class="admin-login-container">
    <div class="admin-login-card">
      <div class="admin-header">
        <div class="admin-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            <path d="M2 17L12 22L22 17" />
            <path d="M2 12L12 17L22 12" />
          </svg>
        </div>
        <h1>관리자 로그인</h1>
        <div class="logo-title">
          <img src="/lion_rocket_logo.png" alt="LionRocket" class="logo" />
          <p>LionRocket 관리 시스템</p>
        </div>
      </div>

      <form @submit.prevent="handleAdminLogin" class="admin-form">
        <div class="form-group">
          <label for="adminId">관리자 ID</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="adminId"
              v-model="credentials.adminId"
              type="text"
              placeholder="관리자 ID를 입력하세요"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe" />
            <span>로그인 상태 유지</span>
          </label>
        </div>

        <button type="submit" class="admin-login-button" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            관리자 로그인
          </span>
        </button>
      </form>

      <div class="admin-footer">
        <router-link to="/login" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          일반 로그인으로 돌아가기
        </router-link>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="decoration decoration-1"></div>
    <div class="decoration decoration-2"></div>
    <div class="decoration decoration-3"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const rememberMe = ref(false)

const credentials = reactive({
  adminId: '',
  password: '',
})

const handleAdminLogin = async () => {
  if (isLoading.value) return

  isLoading.value = true
  
  try {
    // Call the real admin login API
    await authStore.adminLogin({
      adminId: credentials.adminId,
      password: credentials.password
    })
    
    if (rememberMe.value) {
      localStorage.setItem('rememberAdmin', 'true')
    }
    
    // Redirect to admin user management page
    await router.push('/admin/dashboard/users')
  } catch (error: any) {
    console.error('Admin login error:', error)
    
    // Show error notification
    const errorMessage = error.message || '관리자 로그인에 실패했습니다'
    const notificationStore = useNotificationStore()
    notificationStore.error('로그인 실패', errorMessage)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* Decorative elements */
.decoration {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  background: #B8EEA2;
  animation: float 20s ease-in-out infinite;
}

.decoration-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.decoration-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 7s;
}

.decoration-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 10%;
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -30px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}

.admin-login-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem;
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.admin-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.admin-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #5A8F47 0%, #4A7C3C 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(90, 143, 71, 0.3);
}

.admin-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.admin-header h1 {
  color: #1F2937;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.logo-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.logo {
  height: 24px;
  width: auto;
}

.admin-header p {
  color: #6B7280;
  margin: 0;
  font-size: 1rem;
}

.admin-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9CA3AF;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #F9FAFB;
}

.form-group input:focus {
  outline: none;
  border-color: #5A8F47;
  box-shadow: 0 0 0 3px rgba(90, 143, 71, 0.1);
  background: white;
}

.form-group input:focus + .input-icon {
  color: #5A8F47;
}

.form-options {
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4B5563;
  font-size: 0.875rem;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #5A8F47;
  cursor: pointer;
}

.admin-login-button {
  width: 100%;
  background: linear-gradient(135deg, #5A8F47 0%, #4A7C3C 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(90, 143, 71, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.admin-login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(90, 143, 71, 0.4);
}

.admin-login-button:active {
  transform: translateY(0);
}

.admin-login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.admin-login-button svg {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.admin-footer {
  text-align: center;
}

.back-link {
  color: #5A8F47;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.back-link:hover {
  color: #4A7C3C;
  transform: translateX(-2px);
}

.back-link svg {
  width: 16px;
  height: 16px;
}

/* Responsive */
@media (max-width: 640px) {
  .admin-login-card {
    padding: 2rem;
  }
  
  .admin-header h1 {
    font-size: 1.75rem;
  }
  
  .admin-icon {
    width: 64px;
    height: 64px;
  }
  
  .admin-icon svg {
    width: 32px;
    height: 32px;
  }
}
</style>