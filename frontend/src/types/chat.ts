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


export interface ChatMessageResponse {
  user_message: Message
  ai_message: Message
}