import apiClient from './api.client'

// Types
export interface User {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
  total_chats?: number
  total_tokens?: number
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
  total_messages: number
  total_tokens_used: number
  average_tokens_per_user: number
}

export interface UserUsageStat {
  id: number
  user_id: number
  usage_date: string
  chat_count: number
  total_tokens: number
  created_at: string
}

export interface ChatListResponse {
  items: any[]
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

  // System Statistics
  async getSystemStats(): Promise<SystemStats> {
    // Mock data for development - replace with actual API call when ready
    if (process.env.NODE_ENV === 'development') {
      return Promise.resolve({
        total_users: 1234,
        active_users_today: 87,
        total_chats: 5678,
        total_messages: 45892,
        total_tokens_used: 2456789,
        average_tokens_per_user: 1993
      })
    }
    
    const response = await apiClient.get('/admin/stats/overview')
    return response.data
  },
}
