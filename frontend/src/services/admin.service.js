import axios from 'axios';
// Admin API Service
export const adminService = {
    // User Management
    async getUsers(page = 1, limit = 20) {
        const response = await axios.get('/admin/users', {
            params: { page, limit },
        });
        return response.data;
    },
    async getUserChats(userId, page = 1, limit = 20) {
        const response = await axios.get(`/admin/users/${userId}/chats`, {
            params: { page, limit },
        });
        return response.data;
    },
    async getUserUsage(userId, startDate, endDate) {
        const response = await axios.get(`/admin/users/${userId}/usage`, {
            params: { start_date: startDate, end_date: endDate },
        });
        return response.data;
    },
    async toggleAdminStatus(userId) {
        const response = await axios.post(`/admin/users/${userId}/toggle-admin`);
        return response.data;
    },
    async deleteUser(userId) {
        await axios.delete(`/admin/users/${userId}`);
    },
    // System Statistics
    async getSystemStats() {
        const response = await axios.get('/admin/stats/overview');
        return response.data;
    },
};
