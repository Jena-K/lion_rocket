export interface UserProfile {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
}
export interface UserStats {
    total_chats: number;
    total_messages: number;
    total_tokens_used: number;
    active_days: number;
    favorite_character?: string;
    last_chat_date?: string;
}
export interface Chat {
    id: number;
    user_id: number;
    character_id: number;
    created_at: string;
    last_message_at: string;
    message_count?: number;
    character?: {
        id: number;
        name: string;
        system_prompt: string;
    };
}
export interface ChatMessage {
    id: number;
    chat_id: number;
    role: 'user' | 'assistant';
    content: string;
    token_count: number;
    created_at: string;
}
export interface UserSettings {
    theme: 'light' | 'dark' | 'auto';
    language: 'ko' | 'en';
    notifications: boolean;
    email_updates: boolean;
    chat_history_limit: number;
}
export interface PasswordUpdate {
    current_password: string;
    new_password: string;
}
export declare const userService: {
    getProfile(): Promise<UserProfile>;
    updateProfile(data: {
        email?: string;
    }): Promise<UserProfile>;
    updatePassword(data: PasswordUpdate): Promise<void>;
    getStats(): Promise<UserStats>;
    getChats(page?: number, limit?: number): Promise<{
        items: Chat[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }>;
    getChatMessages(chatId: number, limit?: number): Promise<ChatMessage[]>;
    deleteChat(chatId: number): Promise<void>;
    getSettings(): UserSettings;
    saveSettings(settings: UserSettings): void;
};
