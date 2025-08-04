export interface User {
    user_id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
}
export interface UserWithStats extends User {
    total_chats: number;
    total_tokens: number;
    total_characters: number;
    total_prompts: number;
}
export interface LoginCredentials {
    username: string;
    password: string;
}
export interface RegisterData {
    username: string;
    email: string;
    password: string;
}
export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}
export interface ApiError {
    detail: string;
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
export interface Character {
    character_id: number;
    name: string;
    gender: Gender;
    intro: string;
    personality_tags: string[];
    interest_tags: string[];
    prompt: string;
    created_by: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    avatar_url?: string;
    chat_count?: number;
    total_messages?: number;
    unique_users?: number;
    last_used?: string;
}
export interface CharacterCreate {
    name: string;
    gender: Gender;
    intro: string;
    personality_tags: string[];
    interest_tags: string[];
    prompt: string;
}
export interface CharacterUpdate {
    name?: string;
    gender?: Gender;
    intro?: string;
    personality_tags?: string[];
    interest_tags?: string[];
    prompt?: string;
    avatar_url?: string;
}
export interface CharacterListResponse {
    characters: Character[];
    total: number;
    skip: number;
    limit: number;
}
export interface CharacterSelectionResponse {
    message: string;
    character: Character;
}
