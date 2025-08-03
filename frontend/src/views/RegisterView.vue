<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>회원가입</h1>
        <p>LionRocket AI Chat에 가입하세요</p>
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
          <small>최소 8자, 대소문자, 숫자, 특수문자 중 3가지 이상 포함</small>
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

const isFormValid = computed(() => {
  return (
    formData.username.length >= 3 &&
    formData.email.includes('@') &&
    formData.password.length >= 8 &&
    formData.password === confirmPassword.value
  )
})

const handleRegister = async () => {
  if (isLoading.value || !isFormValid.value) return

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
    errorMessage.value = error.message || '회원가입에 실패했습니다.'
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.register-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.register-header p {
  color: #666;
  margin: 0;
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
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #666;
  font-size: 0.8rem;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.register-button {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.register-button:hover:not(:disabled) {
  background: #5a6fd8;
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-footer {
  text-align: center;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
