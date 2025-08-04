import axios from 'axios'

// Types
export interface UserProfile {
  user_id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface UserStats {
  total_chats: number
  total_messages: number
  total_tokens_used: number
  active_days: number
  favorite_character?: string
  last_chat_date?: string
}

export interface Chat {
  chat_id: number
  user_id: number
  character_id: number
  created_at: string
  last_message_at: string
  message_count?: number
  character?: {
    character_id: number
    name: string
    system_prompt: string
  }
}

export interface ChatMessage {
  message_id: number
  chat_id: number
  role: 'user' | 'assistant'
  content: string
  token_count: number
  created_at: string
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'ko' | 'en'
  notifications: boolean
  email_updates: boolean
  chat_history_limit: number
}

export interface PasswordUpdate {
  current_password: string
  new_password: string
}

// User API Service
export const userService = {
  // Profile
  async getProfile(): Promise<UserProfile> {
    const response = await axios.get('/auth/me')
    return response.data
  },

  async updateProfile(data: { email?: string }): Promise<UserProfile> {
    const response = await axios.put('/auth/profile', data)
    return response.data
  },

  async updatePassword(data: PasswordUpdate): Promise<void> {
    await axios.put('/auth/password', data)
  },

  // Stats
  async getStats(): Promise<UserStats> {
    const response = await axios.get('/api/user/stats')
    return response.data
  },

  // Chats
  async getChats(
    page = 1,
    limit = 20
  ): Promise<{
    items: Chat[]
    total: number
    page: number
    pages: number
    limit: number
  }> {
    const response = await axios.get('/api/chats', {
      params: { page, limit },
    })
    return response.data
  },

  async getChatMessages(chatId: number, limit = 50): Promise<ChatMessage[]> {
    const response = await axios.get(`/api/chats/${chatId}/messages`, {
      params: { limit },
    })
    return response.data
  },

  async deleteChat(chatId: number): Promise<void> {
    await axios.delete(`/api/chats/${chatId}`)
  },

  // Settings (local storage for now, can be moved to backend)
  getSettings(): UserSettings {
    const stored = localStorage.getItem('user_settings')
    if (stored) {
      return JSON.parse(stored)
    }
    return {
      theme: 'light',
      language: 'ko',
      notifications: true,
      email_updates: false,
      chat_history_limit: 50,
    }
  },

  saveSettings(settings: UserSettings): void {
    localStorage.setItem('user_settings', JSON.stringify(settings))
    // Apply theme immediately
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
}
