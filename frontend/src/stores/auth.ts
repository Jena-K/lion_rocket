import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../services/api.client'
import { router } from '../router'
import { useNotificationStore } from './notification'

interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface AdminLoginCredentials {
  adminId: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
}

interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

interface RefreshResponse {
  access_token: string
  token_type: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.is_admin || false)

  // Actions
  const initializeAuth = () => {
    // 로컬 스토리지에서 토큰과 사용자 정보 복원
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
        // Auth token is automatically handled by apiClient
      } catch (error) {
        // 저장된 데이터가 유효하지 않으면 클리어
        clearAuth()
      }
    }
  }

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      const response = await apiClient.post<AuthResponse>('/auth/login', formData)
      const authData = response.data

      setAuth(authData)

      // Show success notification
      const notificationStore = useNotificationStore()
      notificationStore.success('로그인되었습니다!', '환영합니다')
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  const adminLogin = async (credentials: AdminLoginCredentials): Promise<void> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/admin/login', credentials)
      const authData = response.data

      // Verify the user is an admin
      if (!authData.user.is_admin) {
        throw new Error('Access denied. Admin privileges required.')
      }

      setAuth(authData)

      // Show success notification
      const notificationStore = useNotificationStore()
      notificationStore.success('관리자로 로그인되었습니다!', '관리자 대시보드로 이동합니다')
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '관리자 로그인에 실패했습니다')
    }
  }

  const register = async (registerData: RegisterData): Promise<void> => {
    try {
      await apiClient.post('/auth/register', registerData)
      // 회원가입 후 자동 로그인
      await login({
        username: registerData.username,
        password: registerData.password,
      })
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed')
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      // 로그아웃 API 실패해도 로컬 데이터는 클리어
      console.warn('Logout API failed:', error)
    } finally {
      clearAuth()
      router.push('/login')

      // Show notification
      const notificationStore = useNotificationStore()
      notificationStore.info('로그아웃되었습니다')
    }
  }

  const getCurrentUser = async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/auth/me')
      user.value = response.data
      localStorage.setItem('auth_user', JSON.stringify(response.data))
      return response.data
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  const setAuth = (authData: AuthResponse): void => {
    user.value = authData.user
    token.value = authData.access_token

    // 로컬 스토리지에 저장
    localStorage.setItem('auth_token', authData.access_token)
    localStorage.setItem('auth_user', JSON.stringify(authData.user))

    // Auth token is automatically handled by apiClient
  }

  const clearAuth = (): void => {
    user.value = null
    token.value = null

    // 로컬 스토리지에서 제거
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('token_expiry')

    // Auth token removal is automatically handled by apiClient
  }

  // setupAxiosInterceptors is no longer needed as apiClient handles this

  return {
    // State
    user,
    token,

    // Getters
    isAuthenticated,
    isAdmin,

    // Actions
    initializeAuth,
    login,
    adminLogin,
    register,
    logout,
    getCurrentUser,
    setAuth,
    clearAuth,
    refreshToken: async (): Promise<void> => {
      try {
        if (!token.value) {
          throw new Error('No token to refresh')
        }

        const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
          token: token.value,
        })

        token.value = response.data.access_token
        localStorage.setItem('auth_token', response.data.access_token)

        // Auth token update is automatically handled by apiClient
      } catch (error) {
        clearAuth()
        throw error
      }
    },
  }
})
