import apiClient from './api.client'
import type { Character, CharacterCreate, CharacterUpdate } from '@/types/character'

export class CharacterService {
  /**
   * Create a new character
   */
  async createCharacter(data: CharacterCreate): Promise<Character> {
    const response = await apiClient.post('/api/characters/', data)
    return response.data
  }

  /**
   * Get list of characters
   */
  async getCharacters(params?: {
    skip?: number
    limit?: number
    search?: string
    category?: string
    include_private?: boolean
  }): Promise<{ characters: Character[]; total: number }> {
    const response = await apiClient.get('/api/characters/', { params })
    return response.data
  }

  /**
   * Get user's own characters
   */
  async getMyCharacters(params?: {
    skip?: number
    limit?: number
  }): Promise<{ characters: Character[]; total: number }> {
    const response = await apiClient.get('/api/characters/my', { params })
    return response.data
  }

  /**
   * Get a specific character
   */
  async getCharacter(characterId: number): Promise<Character> {
    const response = await apiClient.get(`/api/characters/${characterId}`)
    return response.data
  }

  /**
   * Update a character
   */
  async updateCharacter(characterId: number, data: CharacterUpdate): Promise<Character> {
    const response = await apiClient.put(`/api/characters/${characterId}`, data)
    return response.data
  }

  /**
   * Delete a character
   */
  async deleteCharacter(characterId: number): Promise<void> {
    await apiClient.delete(`/api/characters/${characterId}`)
  }

  /**
   * Upload character avatar
   */
  async uploadAvatar(characterId: number, file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`/api/characters/${characterId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }
}

// Export singleton instance
export const characterService = new CharacterService()

// Export types
export type { Character, CharacterCreate, CharacterUpdate }
