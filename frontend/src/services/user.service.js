import axios from 'axios';
// User API Service
export const userService = {
    // Profile
    async getProfile() {
        const response = await axios.get('/auth/me');
        return response.data;
    },
    async updateProfile(data) {
        const response = await axios.put('/auth/profile', data);
        return response.data;
    },
    async updatePassword(data) {
        await axios.put('/auth/password', data);
    },
    // Stats
    async getStats() {
        const response = await axios.get('/api/user/stats');
        return response.data;
    },
    // Chats
    async getChats(page = 1, limit = 20) {
        const response = await axios.get('/api/chats', {
            params: { page, limit },
        });
        return response.data;
    },
    async getChatMessages(chatId, limit = 50) {
        const response = await axios.get(`/api/chats/${chatId}/messages`, {
            params: { limit },
        });
        return response.data;
    },
    async deleteChat(chatId) {
        await axios.delete(`/api/chats/${chatId}`);
    },
    // Settings (local storage for now, can be moved to backend)
    getSettings() {
        const stored = localStorage.getItem('user_settings');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            theme: 'light',
            language: 'ko',
            notifications: true,
            email_updates: false,
            chat_history_limit: 50,
        };
    },
    saveSettings(settings) {
        localStorage.setItem('user_settings', JSON.stringify(settings));
        // Apply theme immediately
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    },
};
