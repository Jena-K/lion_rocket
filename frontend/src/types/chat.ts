// Chat related types

export enum ChatRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export interface Message {
  chat_id: number
  user_id: number
  character_id: number
  role: ChatRole
  content: string
  created_at: string
}

export interface MessageCreate {
  content: string
  character_id: number
}

export interface ChatSession {
  id: number
  user_id: number
  character_id: number
  title?: string
  created_at: string
  last_chat_at?: string
}

export interface ConversationEndResponse {
  message: string
  summary_created: boolean
}