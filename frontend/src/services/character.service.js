import apiClient from './api.client';
export class CharacterService {
    /**
     * Create a new character
     */
    async createCharacter(data) {
        const response = await apiClient.post('/characters/', data);
        return response.data;
    }
    /**
     * Get list of characters (user's own characters)
     */
    async getCharacters(params) {
        const response = await apiClient.get('/characters/', { params });
        return response.data;
    }
    /**
     * Get list of available characters for selection
     */
    async getAvailableCharacters(params) {
        const response = await apiClient.get('/characters/available', { params });
        return response.data;
    }
    /**
     * Get the currently active character
     */
    async getActiveCharacter() {
        const response = await apiClient.get('/characters/active');
        return response.data;
    }
    /**
     * Select a character as active
     */
    async selectCharacter(characterId) {
        const response = await apiClient.post(`/characters/${characterId}/select`);
        return response.data;
    }
    /**
     * Get a specific character
     */
    async getCharacter(characterId) {
        const response = await apiClient.get(`/characters/${characterId}`);
        return response.data;
    }
    /**
     * Update a character
     */
    async updateCharacter(characterId, data) {
        const response = await apiClient.put(`/characters/${characterId}`, data);
        return response.data;
    }
    /**
     * Delete a character
     */
    async deleteCharacter(characterId) {
        await apiClient.delete(`/characters/${characterId}`);
    }
    /**
     * Upload character avatar
     */
    async uploadAvatar(characterId, file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post(`/characters/${characterId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}
// Export singleton instance
export const characterService = new CharacterService();
