<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>회원가입</h1>
        <div class="logo-title">
          <img src="/lion_rocket_logo.png" alt="LionRocket" class="logo" />
          <p>LionRocket AI Chat에 가입하세요</p>
        </div>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="username">사용자명</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            :disabled="isLoading"
            autocomplete="username"
            minlength="3"
            maxlength="20"
          />
          <small>3-20자의 영문, 숫자, 밑줄(_)만 사용 가능</small>
        </div>

        <div class="form-group">
          <label for="email">이메일</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            :disabled="isLoading"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            :disabled="isLoading"
            autocomplete="new-password"
            minlength="8"
          />
          <small>최소 8자, 대문자/소문자/숫자/특수문자(!@#$%^&*() 등) 중 3가지 이상 포함</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            :disabled="isLoading"
            autocomplete="new-password"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="register-button" :disabled="isLoading || !isFormValid">
          <span v-if="isLoading">회원가입 중...</span>
          <span v-else>회원가입</span>
        </button>
      </form>

      <div class="register-footer">
        <p>
          이미 계정이 있으신가요?
          <router-link to="/login">로그인</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')
const confirmPassword = ref('')

const formData = reactive({
  username: '',
  email: '',
  password: '',
})

const validatePassword = (password: string): boolean => {
  // 최소 8자 이상
  if (password.length < 8) return false
  
  // 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 포함
  let criteria = 0
  if (/[A-Z]/.test(password)) criteria++
  if (/[a-z]/.test(password)) criteria++
  if (/[0-9]/.test(password)) criteria++
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) criteria++
  
  return criteria >= 3
}

const isFormValid = computed(() => {
  return (
    formData.username.length >= 3 &&
    formData.username.length <= 50 &&
    /^[a-zA-Z0-9_]+$/.test(formData.username) && // 영문, 숫자, 밑줄만
    formData.email.includes('@') &&
    validatePassword(formData.password) &&
    formData.password === confirmPassword.value
  )
})

const handleRegister = async () => {
  if (isLoading.value || !isFormValid.value) return

  // 상세한 유효성 검사 메시지
  if (formData.username.length < 3 || formData.username.length > 50) {
    errorMessage.value = '사용자명은 3-50자 사이여야 합니다.'
    return
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    errorMessage.value = '사용자명은 영문, 숫자, 밑줄(_)만 사용 가능합니다.'
    return
  }

  if (!formData.email.includes('@')) {
    errorMessage.value = '올바른 이메일 형식이 아닙니다.'
    return
  }

  if (!validatePassword(formData.password)) {
    errorMessage.value = '비밀번호는 8자 이상이며, 대문자, 소문자, 숫자, 특수문자 중 3가지 이상을 포함해야 합니다.'
    return
  }

  if (formData.password !== confirmPassword.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    await authStore.register(formData)
    router.push('/')
  } catch (error: any) {
    // 백엔드에서 온 구체적인 에러 메시지 표시
    if (error.response?.data?.detail) {
      errorMessage.value = error.response.data.detail
    } else {
      errorMessage.value = error.message || '회원가입에 실패했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%);
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

.register-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(184, 238, 162, 0.1) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-30px, 30px) rotate(120deg); }
  66% { transform: translate(20px, -20px) rotate(240deg); }
}

.register-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
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
}

.logo {
  height: 24px;
  width: auto;
}

.register-header p {
  color: #6B7280;
  margin: 0;
  font-size: 0.95rem;
}

.register-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
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

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.8rem;
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

.register-button {
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

.register-button:hover:not(:disabled) {
  background: #4A7C3C;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(90, 143, 71, 0.35);
}

.register-button:focus {
  background: #3D6630;
  box-shadow: 0 0 0 3px rgba(184, 238, 162, 0.4);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
}

.register-footer p {
  color: #6B7280;
  font-size: 0.875rem;
}

.register-footer a {
  color: #5A8F47;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.register-footer a:hover {
  color: #4A7C3C;
  text-decoration: underline;
}
</style>
