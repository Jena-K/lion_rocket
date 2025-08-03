import type { Chat, Message, ChatCreate, MessageCreate } from '@/types/chat';
export declare class ChatService {
    private sseConnections;
    /**
     * Create a new chat
     */
    createChat(data: ChatCreate): Promise<Chat>;
    /**
     * Get list of chats
     */
    getChats(params?: {
        skip?: number;
        limit?: number;
        character_id?: number;
    }): Promise<{
        chats: Chat[];
        total: number;
    }>;
    /**
     * Get a specific chat
     */
    getChat(chatId: number): Promise<Chat>;
    /**
     * Delete a chat
     */
    deleteChat(chatId: number): Promise<void>;
    /**
     * Get messages for a chat
     */
    getMessages(chatId: number, params?: {
        skip?: number;
        limit?: number;
    }): Promise<Message[]>;
    /**
     * Send a message to a chat
     */
    sendMessage(chatId: number, data: MessageCreate): Promise<Message>;
    /**
     * Connect to chat SSE stream for real-time messages
     */
    connectToChat(chatId: number, onMessage: (event: MessageEvent) => void, onError?: (error: Event) => void, onOpen?: () => void): void;
    /**
     * Disconnect from chat SSE stream
     */
    disconnectFromChat(chatId: number): void;
    /**
     * Disconnect from all SSE streams
     */
    disconnectAll(): void;
}
export declare const chatService: ChatService;
export type { Chat, Message, ChatCreate, MessageCreate };
