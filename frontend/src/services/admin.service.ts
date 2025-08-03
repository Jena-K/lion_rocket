import axios from 'axios'

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
    const response = await axios.get('/admin/users', {
      params: { page, limit },
    })
    return response.data
  },

  async getUserChats(userId: number, page = 1, limit = 20): Promise<ChatListResponse> {
    const response = await axios.get(`/admin/users/${userId}/chats`, {
      params: { page, limit },
    })
    return response.data
  },

  async getUserUsage(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Promise<UserUsageStat[]> {
    const response = await axios.get(`/admin/users/${userId}/usage`, {
      params: { start_date: startDate, end_date: endDate },
    })
    return response.data
  },

  async toggleAdminStatus(userId: number): Promise<User> {
    const response = await axios.post(`/admin/users/${userId}/toggle-admin`)
    return response.data
  },

  async deleteUser(userId: number): Promise<void> {
    await axios.delete(`/admin/users/${userId}`)
  },

  // System Statistics
  async getSystemStats(): Promise<SystemStats> {
    const response = await axios.get('/admin/stats/overview')
    return response.data
  },
}
