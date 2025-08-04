import type { Message, MessageCreate } from '@/types/chat';
export interface ChatMessageResponse {
    user_message: Message;
    ai_message: Message;
}
export declare class ChatService {
    /**
     * Send a message to a character and get AI response
     */
    sendMessage(data: MessageCreate & {
        character_id: number;
    }): Promise<ChatMessageResponse>;
    /**
     * Get messages between user and character
     */
    getMessages(characterId: number, params?: {
        skip?: number;
        limit?: number;
    }): Promise<Message[]>;
    /**
     * End conversation with a character
     */
    endConversation(characterId: number): Promise<{
        message: string;
        summary_created: boolean;
    }>;
}
export declare const chatService: ChatService;
export type { Message, MessageCreate };
