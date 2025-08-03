import axios from 'axios';
// Prompt API Service
export const promptService = {
    async getPrompts() {
        const response = await axios.get('/api/prompts');
        return response.data;
    },
    async createPrompt(data) {
        const response = await axios.post('/api/prompts', data);
        return response.data;
    },
    async updatePrompt(id, data) {
        const response = await axios.put(`/api/prompts/${id}`, data);
        return response.data;
    },
    async deletePrompt(id) {
        await axios.delete(`/api/prompts/${id}`);
    },
};
