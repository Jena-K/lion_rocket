import apiClient from './api.client';
export class CharacterService {
    /**
     * Create a new character
     */
    async createCharacter(data) {
        const response = await apiClient.post('/api/characters/', data);
        return response.data;
    }
    /**
     * Get list of characters
     */
    async getCharacters(params) {
        const response = await apiClient.get('/api/characters/', { params });
        return response.data;
    }
    /**
     * Get user's own characters
     */
    async getMyCharacters(params) {
        const response = await apiClient.get('/api/characters/my', { params });
        return response.data;
    }
    /**
     * Get a specific character
     */
    async getCharacter(characterId) {
        const response = await apiClient.get(`/api/characters/${characterId}`);
        return response.data;
    }
    /**
     * Update a character
     */
    async updateCharacter(characterId, data) {
        const response = await apiClient.put(`/api/characters/${characterId}`, data);
        return response.data;
    }
    /**
     * Delete a character
     */
    async deleteCharacter(characterId) {
        await apiClient.delete(`/api/characters/${characterId}`);
    }
    /**
     * Upload character avatar
     */
    async uploadAvatar(characterId, file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`/api/characters/${characterId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}
// Export singleton instance
export const characterService = new CharacterService();
