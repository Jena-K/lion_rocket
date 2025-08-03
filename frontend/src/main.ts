import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import axios from 'axios'

// Pinia 스토어 생성
const pinia = createPinia()

// Axios 기본 설정
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// 앱 생성 및 설정
const app = createApp(App)
app.use(pinia)
app.use(router)

// 인증 토큰 복원 및 Axios 인터셉터 설정
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
