import apiClient from './api.client'
import type { Message, MessageCreate } from '@/types/chat'

export interface ChatMessageResponse {
  user_message: Message
  ai_message: Message
}

export class ChatService {
  /**
   * Send a message to a character and get AI response
   */
  async sendMessage(data: MessageCreate & { character_id: number }): Promise<ChatMessageResponse> {
    const response = await apiClient.post('/chats/', data)
    return response.data
  }

  /**
   * Get messages between user and character
   */
  async getMessages(
    characterId: number,
    params?: {
      skip?: number
      limit?: number
    }
  ): Promise<Message[]> {
    const response = await apiClient.get('/chats/', {
      params: {
        character_id: characterId,
        ...params
      }
    })
    return response.data
  }

  /**
   * End conversation with a character
   */
  async endConversation(characterId: number): Promise<{ message: string; summary_created: boolean }> {
    const response = await apiClient.post(`/chats/end-conversation/${characterId}`)
    return response.data
  }
}

// Export singleton instance
export const chatService = new ChatService()

// Export types
export type { Message, MessageCreate }