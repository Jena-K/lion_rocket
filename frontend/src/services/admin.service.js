import apiClient from './api.client';
// Admin API Service
export const adminService = {
    // User Management
    async getUsers(page = 1, limit = 20) {
        const response = await apiClient.get('/admin/users', {
            params: { page, limit },
        });
        return response.data;
    },
    async getUserChats(userId, page = 1, limit = 20) {
        const response = await apiClient.get(`/admin/users/${userId}/chats`, {
            params: { page, limit },
        });
        return response.data;
    },
    async getUserUsage(userId, startDate, endDate) {
        const response = await apiClient.get(`/admin/users/${userId}/usage`, {
            params: { start_date: startDate, end_date: endDate },
        });
        return response.data;
    },
    async toggleAdminStatus(userId) {
        const response = await apiClient.post(`/admin/users/${userId}/toggle-admin`);
        return response.data;
    },
    async deleteUser(userId) {
        await apiClient.delete(`/admin/users/${userId}`);
    },
    // Chat History
    async getUserCharacterStats(userId) {
        const response = await apiClient.get(`/admin/users/${userId}/characters`);
        return response.data;
    },
    async getUserChats2(userId, characterId, page = 1, limit = 100) {
        const response = await apiClient.get(`/admin/users/${userId}/chats`, {
            params: { character_id: characterId, page, limit },
        });
        return response.data;
    },
    // System Statistics
    async getSystemStats() {
        // Mock data for development - replace with actual API call when ready
        if (process.env.NODE_ENV === 'development') {
            return Promise.resolve({
                total_users: 1234,
                active_users_today: 87,
                total_chats: 5678,
                average_tokens_per_user: 1993
            });
        }
        const response = await apiClient.get('/admin/stats/overview');
        return response.data;
    },
};
