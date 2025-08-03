export interface User {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
    total_chats?: number;
    total_tokens?: number;
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
    total_messages: number;
    total_tokens_used: number;
    average_tokens_per_user: number;
}
export interface UserUsageStat {
    id: number;
    user_id: number;
    usage_date: string;
    chat_count: number;
    total_tokens: number;
    created_at: string;
}
export interface ChatListResponse {
    items: any[];
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
    getSystemStats(): Promise<SystemStats>;
};
