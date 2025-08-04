import apiClient from './api.client'
import type { Character, CharacterCreate, CharacterUpdate, CharacterListResponse, CharacterSelectionResponse } from '@/types'

export type { Character, CharacterCreate, CharacterUpdate, CharacterListResponse, CharacterSelectionResponse }

export class CharacterService {
  /**
   * Create a new character
   */
  async createCharacter(data: CharacterCreate): Promise<Character> {
    const response = await apiClient.post('/characters/', data)
    return response.data
  }

  /**
   * Get list of characters (user's own characters)
   */
  async getCharacters(params?: {
    skip?: number
    limit?: number
    search?: string
  }): Promise<CharacterListResponse> {
    const response = await apiClient.get('/characters/', { params })
    return response.data
  }

  /**
   * Get list of available characters for selection
   */
  async getAvailableCharacters(params?: {
    skip?: number
    limit?: number
    search?: string
  }): Promise<CharacterListResponse> {
    const response = await apiClient.get('/characters/available', { params })
    return response.data
  }

  /**
   * Get the currently active character
   */
  async getActiveCharacter(): Promise<Character> {
    const response = await apiClient.get('/characters/active')
    return response.data
  }

  /**
   * Select a character as active
   */
  async selectCharacter(characterId: number): Promise<CharacterSelectionResponse> {
    const response = await apiClient.post(`/characters/${characterId}/select`)
    return response.data
  }

  /**
   * Get a specific character
   */
  async getCharacter(characterId: number): Promise<Character> {
    const response = await apiClient.get(`/characters/${characterId}`)
    return response.data
  }

  /**
   * Update a character
   */
  async updateCharacter(characterId: number, data: CharacterUpdate): Promise<Character> {
    const response = await apiClient.put(`/characters/${characterId}`, data)
    return response.data
  }

  /**
   * Delete a character
   */
  async deleteCharacter(characterId: number): Promise<void> {
    await apiClient.delete(`/characters/${characterId}`)
  }

  /**
   * Upload character avatar
   */
  async uploadAvatar(characterId: number, file: File): Promise<{ avatar_url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post(`/characters/${characterId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data
  }
}

// Export singleton instance
export const characterService = new CharacterService()
