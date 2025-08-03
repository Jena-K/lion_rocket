import apiClient from './api.client'
import type { Chat, Message, ChatCreate, MessageCreate } from '@/types/chat'

export class ChatService {
  private sseConnections: Map<number, EventSource> = new Map()

  /**
   * Create a new chat
   */
  async createChat(data: ChatCreate): Promise<Chat> {
    const response = await apiClient.post('/api/chats/', data)
    return response.data
  }

  /**
   * Get list of chats
   */
  async getChats(params?: {
    skip?: number
    limit?: number
    character_id?: number
  }): Promise<{ chats: Chat[]; total: number }> {
    const response = await apiClient.get('/api/chats/', { params })
    return response.data
  }

  /**
   * Get a specific chat
   */
  async getChat(chatId: number): Promise<Chat> {
    const response = await apiClient.get(`/api/chats/${chatId}`)
    return response.data
  }

  /**
   * Delete a chat
   */
  async deleteChat(chatId: number): Promise<void> {
    await apiClient.delete(`/api/chats/${chatId}`)
    this.disconnectFromChat(chatId)
  }

  /**
   * Get messages for a chat
   */
  async getMessages(
    chatId: number,
    params?: {
      skip?: number
      limit?: number
    }
  ): Promise<Message[]> {
    const response = await apiClient.get(`/api/chats/${chatId}/messages`, { params })
    return response.data
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: number, data: MessageCreate): Promise<Message> {
    const response = await apiClient.post(`/api/chats/${chatId}/messages`, data)
    return response.data
  }

  /**
   * Connect to chat SSE stream for real-time messages
   */
  connectToChat(
    chatId: number,
    onMessage: (event: MessageEvent) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void
  ): void {
    // Disconnect existing connection if any
    this.disconnectFromChat(chatId)

    // Get auth token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.error('No auth token available for SSE connection')
      return
    }

    // Create SSE connection
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const url = `${baseUrl}/api/chats/${chatId}/stream`

    const eventSource = new EventSource(url, {
      withCredentials: true,
    })

    // Handle connection open
    eventSource.onopen = () => {
      console.log(`Connected to chat ${chatId} SSE stream`)
      if (onOpen) onOpen()
    }

    // Handle messages
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(new MessageEvent('message', { data }))
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    // Handle specific event types
    eventSource.addEventListener('message', (event) => {
      onMessage(event)
    })

    eventSource.addEventListener('message_start', (event) => {
      onMessage(new MessageEvent('message_start', { data: JSON.parse(event.data) }))
    })

    eventSource.addEventListener('message_chunk', (event) => {
      onMessage(new MessageEvent('message_chunk', { data: JSON.parse(event.data) }))
    })

    eventSource.addEventListener('message_complete', (event) => {
      onMessage(new MessageEvent('message_complete', { data: JSON.parse(event.data) }))
    })

    eventSource.addEventListener('error', (event) => {
      onMessage(new MessageEvent('error', { data: JSON.parse(event.data) }))
    })

    eventSource.addEventListener('ping', () => {
      // Keep-alive ping, no action needed
    })

    // Handle errors
    eventSource.onerror = (error) => {
      console.error(`SSE error for chat ${chatId}:`, error)
      if (onError) onError(error)

      // Reconnect after 5 seconds if not intentionally closed
      if (eventSource.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          if (this.sseConnections.has(chatId)) {
            console.log(`Reconnecting to chat ${chatId}...`)
            this.connectToChat(chatId, onMessage, onError, onOpen)
          }
        }, 5000)
      }
    }

    // Store connection
    this.sseConnections.set(chatId, eventSource)
  }

  /**
   * Disconnect from chat SSE stream
   */
  disconnectFromChat(chatId: number): void {
    const eventSource = this.sseConnections.get(chatId)
    if (eventSource) {
      eventSource.close()
      this.sseConnections.delete(chatId)
      console.log(`Disconnected from chat ${chatId} SSE stream`)
    }
  }

  /**
   * Disconnect from all SSE streams
   */
  disconnectAll(): void {
    this.sseConnections.forEach((eventSource, chatId) => {
      eventSource.close()
      console.log(`Disconnected from chat ${chatId} SSE stream`)
    })
    this.sseConnections.clear()
  }
}

// Export singleton instance
export const chatService = new ChatService()

// Export types
export type { Chat, Message, ChatCreate, MessageCreate }
