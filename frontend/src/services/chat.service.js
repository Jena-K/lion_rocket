import apiClient from './api.client';
export class ChatService {
    /**
     * Send a message to a character and get AI response
     */
    async sendMessage(data) {
        const response = await apiClient.post('/chats/', data);
        return response.data;
    }
    /**
     * Get messages between user and character
     */
    async getMessages(characterId, params) {
        const response = await apiClient.get('/chats/', {
            params: {
                character_id: characterId,
                ...params
            }
        });
        return response.data;
    }
    /**
     * End conversation with a character
     */
    async endConversation(characterId) {
        const response = await apiClient.post(`/chats/end-conversation/${characterId}`);
        return response.data;
    }
}
// Export singleton instance
export const chatService = new ChatService();
