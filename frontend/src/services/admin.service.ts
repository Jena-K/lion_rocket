import apiClient from './api.client'

// Types
export interface User {
  user_id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
  total_chats?: number
  last_active?: string
}

export interface UserListResponse {
  items: User[]
  total: number
  page: number
  pages: number
  limit: number
}

export interface SystemStats {
  total_users: number
  active_users_today: number
  total_chats: number
  average_tokens_per_user: number
}

export interface UserUsageStat {
  stat_id: number
  user_id: number
  usage_date: string
  chat_count: number
  created_at: string
}

export interface ChatListResponse {
  items: any[]
  total: number
  page: number
  pages: number
  limit: number
}

export interface CharacterChatStats {
  character_id: number
  name: string
  avatar_url?: string
  chatCount: number
  messageCount: number
  lastChatDate: string
  firstChatDate: string
  avgMessagesPerChat: number
  avgChatDuration: number
}

export interface ChatMessage {
  message_id: number
  user_id: number
  character_id: number
  role: string
  content: string
  created_at: string
}

export interface Chat {
  chat_id: number
  user_id: number
  character_id: number
  role: string
  content: string
  created_at: string
}

export interface ChatListResponse2 {
  items: Chat[]
  total: number
  page: number
  pages: number
  limit: number
}

// Admin API Service
export const adminService = {
  // User Management
  async getUsers(page = 1, limit = 20): Promise<UserListResponse> {
    const response = await apiClient.get('/admin/users', {
      params: { page, limit },
    })
    return response.data
  },

  async getUserChats(userId: number, page = 1, limit = 20): Promise<ChatListResponse> {
    const response = await apiClient.get(`/admin/users/${userId}/chats`, {
      params: { page, limit },
    })
    return response.data
  },

  async getUserUsage(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<UserUsageStat[]> {
    const response = await apiClient.get(`/admin/users/${userId}/usage`, {
      params: { start_date: startDate, end_date: endDate },
    })
    return response.data
  },

  async toggleAdminStatus(userId: number): Promise<User> {
    const response = await apiClient.post(`/admin/users/${userId}/toggle-admin`)
    return response.data
  },

  async deleteUser(userId: number): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`)
  },

  // Chat History
  async getUserCharacterStats(userId: number): Promise<CharacterChatStats[]> {
    const response = await apiClient.get(`/admin/users/${userId}/characters`)
    return response.data
  },

  async getUserChats2(
    userId: number, 
    characterId?: number, 
    page = 1, 
    limit = 100
  ): Promise<ChatListResponse2> {
    const response = await apiClient.get(`/admin/users/${userId}/chats`, {
      params: { character_id: characterId, page, limit },
    })
    return response.data
  },

  // System Statistics
  async getSystemStats(): Promise<SystemStats> {
    // Mock data for development - replace with actual API call when ready
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        total_users: 1234,
        active_users_today: 87,
        total_chats: 5678,
        average_tokens_per_user: 1993
      })
    }
    
    const response = await apiClient.get('/admin/stats/overview')
    return response.data
  },
}
