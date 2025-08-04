import apiClient from './api.client'
import type { Character, CharacterCreate, CharacterUpdate, CharacterListResponse } from '@/types'

export type { Character, CharacterCreate, CharacterUpdate }

export class AdminCharacterService {
  /**
   * Get all characters with filters (Admin only)
   */
  async getCharacters(params?: {
    skip?: number
    limit?: number
    search?: string
    is_active?: boolean
  }): Promise<CharacterListResponse> {
    const response = await apiClient.get('/admin/characters', { params })
    return response.data
  }

  /**
   * Create a new character (Admin only)
   */
  async createCharacter(data: CharacterCreate): Promise<Character> {
    const response = await apiClient.post('/admin/characters', data)
    return response.data
  }

  /**
   * Update a character (Admin only)
   */
  async updateCharacter(characterId: number, data: CharacterUpdate): Promise<Character> {
    const response = await apiClient.put(`/admin/characters/${characterId}`, data)
    return response.data
  }

  /**
   * Toggle character active status (Admin only)
   */
  async toggleActive(characterId: number): Promise<{ message: string; is_active: boolean }> {
    const response = await apiClient.post(`/admin/characters/${characterId}/toggle-active`)
    return response.data
  }

  /**
   * Delete a character (Admin only)
   */
  async deleteCharacter(characterId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/characters/${characterId}`)
    return response.data
  }

  /**
   * Upload character avatar (Admin only)
   */
  async uploadAvatar(characterId: number, file: File): Promise<{ avatar_url: string; message: string }> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post(`/characters/${characterId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Delete character avatar (Admin only)
   */
  async deleteAvatar(characterId: number): Promise<{ message: string }> {
    const response = await apiClient.delete(`/characters/${characterId}/avatar`)
    return response.data
  }

  /**
   * Get character statistics (Admin only)
   */
  async getCharacterStats(): Promise<any> {
    const response = await apiClient.get('/admin/dashboard/character-stats')
    return response.data
  }
}

// Export singleton instance
export const adminCharacterService = new AdminCharacterService()