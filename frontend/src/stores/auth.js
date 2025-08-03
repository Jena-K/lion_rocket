import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
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
                setupAxiosInterceptors();
            }
            catch (error) {
                // 저장된 데이터가 유효하지 않으면 클리어
                clearAuth();
            }
        }
    };
    const login = async (credentials) => {
        try {
            const formData = new FormData();
            formData.append('username', credentials.username);
            formData.append('password', credentials.password);
            const response = await axios.post('/auth/login', formData);
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
    const register = async (registerData) => {
        try {
            await axios.post('/auth/register', registerData);
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
            await axios.post('/auth/logout');
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
            const response = await axios.get('/auth/me');
            user.value = response.data;
            localStorage.setItem('auth_user', JSON.stringify(response.data));
            return response.data;
        }
        catch (error) {
            clearAuth();
            throw error;
        }
    };
    const setAuth = (authData) => {
        user.value = authData.user;
        token.value = authData.access_token;
        // 로컬 스토리지에 저장
        localStorage.setItem('auth_token', authData.access_token);
        localStorage.setItem('auth_user', JSON.stringify(authData.user));
        setupAxiosInterceptors();
    };
    const clearAuth = () => {
        user.value = null;
        token.value = null;
        // 로컬 스토리지에서 제거
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('token_expiry');
        // Axios 헤더에서 토큰 제거
        delete axios.defaults.headers.common['Authorization'];
    };
    const setupAxiosInterceptors = () => {
        // 요청 인터셉터: 모든 요청에 JWT 토큰 추가
        axios.interceptors.request.use((config) => {
            if (token.value) {
                config.headers.Authorization = `Bearer ${token.value}`;
            }
            return config;
        }, (error) => Promise.reject(error));
        // 응답 인터셉터: 401 오류 시 로그아웃 처리
        axios.interceptors.response.use((response) => response, (error) => {
            if (error.response?.status === 401 && token.value) {
                clearAuth();
                router.push('/login');
            }
            return Promise.reject(error);
        });
    };
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
        register,
        logout,
        getCurrentUser,
        setAuth,
        clearAuth,
        refreshToken: async () => {
            try {
                if (!token.value) {
                    throw new Error('No token to refresh');
                }
                const response = await axios.post('/auth/refresh', {
                    token: token.value,
                });
                token.value = response.data.access_token;
                localStorage.setItem('auth_token', response.data.access_token);
                // Update axios headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            }
            catch (error) {
                clearAuth();
                throw error;
            }
        },
    };
});
