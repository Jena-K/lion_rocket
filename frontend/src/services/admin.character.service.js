import apiClient from './api.client';
export class AdminCharacterService {
    /**
     * Get all characters with filters (Admin only)
     */
    async getCharacters(params) {
        const response = await apiClient.get('/admin/characters', { params });
        return response.data;
    }
    /**
     * Create a new character (Admin only)
     */
    async createCharacter(data) {
        const response = await apiClient.post('/admin/characters', data);
        return response.data;
    }
    /**
     * Update a character (Admin only)
     */
    async updateCharacter(characterId, data) {
        const response = await apiClient.put(`/admin/characters/${characterId}`, data);
        return response.data;
    }
    /**
     * Toggle character active status (Admin only)
     */
    async toggleActive(characterId) {
        const response = await apiClient.post(`/admin/characters/${characterId}/toggle-active`);
        return response.data;
    }
    /**
     * Delete a character (Admin only)
     */
    async deleteCharacter(characterId) {
        const response = await apiClient.delete(`/admin/characters/${characterId}`);
        return response.data;
    }
    /**
     * Upload character avatar (Admin only)
     */
    async uploadAvatar(characterId, file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`/characters/${characterId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
    /**
     * Delete character avatar (Admin only)
     */
    async deleteAvatar(characterId) {
        const response = await apiClient.delete(`/characters/${characterId}/avatar`);
        return response.data;
    }
    /**
     * Get character statistics (Admin only)
     */
    async getCharacterStats() {
        const response = await apiClient.get('/admin/dashboard/character-stats');
        return response.data;
    }
}
// Export singleton instance
export const adminCharacterService = new AdminCharacterService();
