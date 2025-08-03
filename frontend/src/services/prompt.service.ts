import axios from 'axios'

// Types
export interface Prompt {
  id: number
  name: string
  prompt_text: string
  created_at: string
  updated_at: string
}

export interface PromptCreate {
  name: string
  prompt_text: string
}

export interface PromptUpdate {
  name?: string
  prompt_text?: string
}

// Prompt API Service
export const promptService = {
  async getPrompts(): Promise<Prompt[]> {
    const response = await axios.get('/api/prompts')
    return response.data
  },

  async createPrompt(data: PromptCreate): Promise<Prompt> {
    const response = await axios.post('/api/prompts', data)
    return response.data
  },

  async updatePrompt(id: number, data: PromptUpdate): Promise<Prompt> {
    const response = await axios.put(`/api/prompts/${id}`, data)
    return response.data
  },

  async deletePrompt(id: number): Promise<void> {
    await axios.delete(`/api/prompts/${id}`)
  },
}
