import apiClient from './api.client'
import type { Message, MessageCreate } from '@/types/chat'

export class ChatService {
  private sseConnections: Map<number, EventSource> = new Map()

  /**
   * Send a message to a character
   */
  async sendMessage(data: MessageCreate & { character_id: number }): Promise<Message> {
    const response = await apiClient.post('/chats/messages', data)
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
    const response = await apiClient.get('/chats/messages', {
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

  /**
   * Connect to character SSE stream for real-time messages
   */
  connectToCharacter(
    characterId: number,
    onMessage: (event: MessageEvent) => void,
    onError?: (error: Event) => void,
    onOpen?: () => void
  ): void {
    // Disconnect existing connection if any
    this.disconnectFromCharacter(characterId)

    // Get auth token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.error('No auth token available for SSE connection')
      return
    }

    // Create SSE connection
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    const url = `${baseUrl}/chats/stream/${characterId}`

    const eventSource = new EventSource(url, {
      withCredentials: true,
    })

    // Handle connection open
    eventSource.onopen = () => {
      console.log(`Connected to character ${characterId} SSE stream`)
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
      console.error(`SSE error for character ${characterId}:`, error)
      if (onError) onError(error)

      // Reconnect after 5 seconds if not intentionally closed
      if (eventSource.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          if (this.sseConnections.has(characterId)) {
            console.log(`Reconnecting to character ${characterId}...`)
            this.connectToCharacter(characterId, onMessage, onError, onOpen)
          }
        }, 5000)
      }
    }

    // Store connection
    this.sseConnections.set(characterId, eventSource)
  }

  /**
   * Disconnect from character SSE stream
   */
  disconnectFromCharacter(characterId: number): void {
    const eventSource = this.sseConnections.get(characterId)
    if (eventSource) {
      eventSource.close()
      this.sseConnections.delete(characterId)
      console.log(`Disconnected from character ${characterId} SSE stream`)
    }
  }

  /**
   * Disconnect from all SSE streams
   */
  disconnectAll(): void {
    this.sseConnections.forEach((eventSource, characterId) => {
      eventSource.close()
      console.log(`Disconnected from character ${characterId} SSE stream`)
    })
    this.sseConnections.clear()
  }
}

// Export singleton instance
export const chatService = new ChatService()

// Export types
export type { Message, MessageCreate }