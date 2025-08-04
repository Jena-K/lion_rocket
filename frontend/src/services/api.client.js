import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import router from '../router';
// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Request interceptor
apiClient.interceptors.request.use((config) => {
    // Add auth token to requests
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Add request ID for tracking
    const requestId = generateRequestId();
    config.headers['X-Request-ID'] = requestId;
    // Add correlation ID for request tracking
    config.headers['X-Correlation-ID'] = requestId;
    // Add user ID if available
    if (authStore.user?.user_id) {
        config.headers['X-User-ID'] = authStore.user.user_id.toString();
    }
    // Log request in development
    if (import.meta.env.DEV) {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            requestId,
        });
    }
    return config;
}, (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
});
// Response interceptor
apiClient.interceptors.response.use((response) => {
    // Log response in development
    if (import.meta.env.DEV) {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
}, async (error) => {
    const originalRequest = error.config;
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const authStore = useAuthStore();
        // Try to refresh token
        try {
            await authStore.refreshToken();
            // Retry original request with new token
            const token = authStore.token;
            if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
        }
        catch (refreshError) {
            // Refresh failed, logout user
            await authStore.logout();
            router.push('/login');
            return Promise.reject(error);
        }
    }
    // Handle other errors
    handleApiError(error);
    return Promise.reject(error);
});
// Error handler
function handleApiError(error) {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    // Enhanced error logging
    console.group(`❌ API Error [${status || 'Network'}]`);
    console.error(`${method} ${url}`);
    console.error('Status:', status || 'No response');
    console.error('Message:', message);
    if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Headers:', error.response.headers);
    }
    else if (error.request) {
        console.error('Request:', error.request);
        console.error('No response received - possible network or CORS issue');
    }
    else {
        console.error('Error:', error.message);
    }
    console.groupEnd();
    // Global error handling
    switch (status) {
        case 400:
            showErrorNotification('잘못된 요청입니다. 입력 내용을 확인해주세요.');
            break;
        case 403:
            showErrorNotification('권한이 없습니다.');
            break;
        case 404:
            // Don't show notification for 404s as they might be expected (e.g., no active character)
            console.log('Resource not found - this might be expected behavior');
            break;
        case 429:
            showErrorNotification('너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.');
            break;
        case 500:
            showErrorNotification('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            break;
        default:
            if (!error.response) {
                console.error('Network/CORS Error Details:', {
                    url: error.config?.url,
                    baseURL: error.config?.baseURL,
                    method: error.config?.method,
                    code: error.code,
                    message: error.message
                });
                showErrorNotification('네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
            }
    }
}
// Notification helper
let notificationStore = null;
function showErrorNotification(message) {
    // Lazy load notification store to avoid circular dependency
    if (!notificationStore) {
        import('../stores/notification').then((module) => {
            notificationStore = module.useNotificationStore();
            notificationStore.error(message);
        });
    }
    else {
        notificationStore.error(message);
    }
}
// Generate unique request ID
function generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
// Export configured client
export default apiClient;
