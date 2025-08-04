import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '../services/api.client';
import { router } from '../router';
import { useNotificationStore } from './notification';
export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(null);
    const token = ref(null);
    // Getters
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const isAdmin = computed(() => user.value?.is_admin || false);
    // Actions
    const initializeAuth = () => {
        // 로컬 스토리지에서 토큰과 사용자 정보 복원
        const savedToken = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('auth_user');
        if (savedToken && savedUser) {
            try {
                token.value = savedToken;
                user.value = JSON.parse(savedUser);
                // Auth token is automatically handled by apiClient
            }
            catch (error) {
                // 저장된 데이터가 유효하지 않으면 클리어
                clearAuth();
            }
        }
    };
    const login = async (credentials) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', credentials.username);
            formData.append('password', credentials.password);
            const response = await apiClient.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const authData = response.data;
            setAuth(authData);
            // Show success notification
            const notificationStore = useNotificationStore();
            notificationStore.success('로그인되었습니다!', '환영합니다');
        }
        catch (error) {
            throw new Error(error.response?.data?.detail || 'Login failed');
        }
    };
    const adminLogin = async (credentials) => {
        try {
            const response = await apiClient.post('/auth/admin/login', credentials);
            const authData = response.data;
            // Verify the user is an admin
            if (!authData.user.is_admin) {
                throw new Error('Access denied. Admin privileges required.');
            }
            setAuth(authData);
            // Show success notification
            const notificationStore = useNotificationStore();
            notificationStore.success('관리자로 로그인되었습니다!', '관리자 대시보드로 이동합니다');
        }
        catch (error) {
            throw new Error(error.response?.data?.detail || '관리자 로그인에 실패했습니다');
        }
    };
    const register = async (registerData) => {
        try {
            await apiClient.post('/auth/register', registerData);
            // 회원가입 후 자동 로그인
            await login({
                username: registerData.username,
                password: registerData.password,
            });
        }
        catch (error) {
            throw new Error(error.response?.data?.detail || 'Registration failed');
        }
    };
    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        }
        catch (error) {
            // 로그아웃 API 실패해도 로컬 데이터는 클리어
            console.warn('Logout API failed:', error);
        }
        finally {
            clearAuth();
            router.push('/login');
            // Show notification
            const notificationStore = useNotificationStore();
            notificationStore.info('로그아웃되었습니다');
        }
    };
    const getCurrentUser = async () => {
        try {
            const response = await apiClient.get('/auth/me');
            user.value = response.data;
            localStorage.setItem('auth_user', JSON.stringify(response.data));
            return response.data;
        }
        catch (error) {
            clearAuth();
            throw error;
        }
    };
    const getCurrentUserStats = async () => {
        try {
            const response = await apiClient.get('/auth/me/stats');
            return response.data;
        }
        catch (error) {
            console.error('Failed to get user stats:', error);
            throw error;
        }
    };
    const setAuth = (authData) => {
        user.value = authData.user;
        token.value = authData.access_token;
        // 로컬 스토리지에 저장
        localStorage.setItem('auth_token', authData.access_token);
        localStorage.setItem('auth_user', JSON.stringify(authData.user));
        // Auth token is automatically handled by apiClient
    };
    const clearAuth = () => {
        user.value = null;
        token.value = null;
        // 로컬 스토리지에서 제거
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('token_expiry');
        // Auth token removal is automatically handled by apiClient
    };
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
        getCurrentUserStats,
        setAuth,
        clearAuth,
        refreshToken: async () => {
            try {
                if (!token.value) {
                    throw new Error('No token to refresh');
                }
                const response = await apiClient.post('/auth/refresh', {
                    token: token.value,
                });
                token.value = response.data.access_token;
                localStorage.setItem('auth_token', response.data.access_token);
                // Auth token update is automatically handled by apiClient
            }
            catch (error) {
                clearAuth();
                throw error;
            }
        },
    };
});
