export interface User {
    user_id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
    total_chats?: number;
    last_active?: string;
}
export interface UserListResponse {
    items: User[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}
export interface SystemStats {
    total_users: number;
    active_users_today: number;
    total_chats: number;
    average_tokens_per_user: number;
}
export interface UserUsageStat {
    stat_id: number;
    user_id: number;
    usage_date: string;
    chat_count: number;
    created_at: string;
}
export interface ChatListResponse {
    items: any[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}
export interface CharacterChatStats {
    character_id: number;
    name: string;
    avatar_url?: string;
    chatCount: number;
    messageCount: number;
    lastChatDate: string;
    firstChatDate: string;
    avgMessagesPerChat: number;
    avgChatDuration: number;
}
export interface ChatMessage {
    message_id: number;
    user_id: number;
    character_id: number;
    role: string;
    content: string;
    created_at: string;
}
export interface Chat {
    chat_id: number;
    user_id: number;
    character_id: number;
    role: string;
    content: string;
    created_at: string;
}
export interface ChatListResponse2 {
    items: Chat[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}
export declare const adminService: {
    getUsers(page?: number, limit?: number): Promise<UserListResponse>;
    getUserChats(userId: number, page?: number, limit?: number): Promise<ChatListResponse>;
    getUserUsage(userId: number, startDate?: string, endDate?: string): Promise<UserUsageStat[]>;
    toggleAdminStatus(userId: number): Promise<User>;
    deleteUser(userId: number): Promise<void>;
    getUserCharacterStats(userId: number): Promise<CharacterChatStats[]>;
    getUserChats2(userId: number, characterId?: number, page?: number, limit?: number): Promise<ChatListResponse2>;
    getSystemStats(): Promise<SystemStats>;
};
