interface User {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    created_at: string;
}
interface LoginCredentials {
    username: string;
    password: string;
}
interface RegisterData {
    username: string;
    email: string;
    password: string;
}
interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", Pick<{
    user: import("vue").Ref<{
        id: number;
        username: string;
        email: string;
        is_admin: boolean;
        created_at: string;
    } | null, User | {
        id: number;
        username: string;
        email: string;
        is_admin: boolean;
        created_at: string;
    } | null>;
    token: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isAdmin: import("vue").ComputedRef<boolean>;
    initializeAuth: () => void;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (registerData: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<User>;
    setAuth: (authData: AuthResponse) => void;
    clearAuth: () => void;
    refreshToken: () => Promise<void>;
}, "user" | "token">, Pick<{
    user: import("vue").Ref<{
        id: number;
        username: string;
        email: string;
        is_admin: boolean;
        created_at: string;
    } | null, User | {
        id: number;
        username: string;
        email: string;
        is_admin: boolean;
        created_at: string;
    } | null>;
    token: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isAdmin: import("vue").ComputedRef<boolean>;
    initializeAuth: () => void;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (registerData: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<User>;
    setAuth: (authData: AuthResponse) => void;
    clearAuth: () => void;
    refreshToken: () => Promise<void>;
}, "isAuthenticated" | "isAdmin">, Pick<{
    user: import("vue").Ref<{
        id: number;
        username: string;
        email: string;
        is_admin: boolean;
        created_at: string;
    } | null, User | {
        id: number;
        username: string;
        email: string;
        is_admin: boolean;
        created_at: string;
    } | null>;
    token: import("vue").Ref<string | null, string | null>;
    isAuthenticated: import("vue").ComputedRef<boolean>;
    isAdmin: import("vue").ComputedRef<boolean>;
    initializeAuth: () => void;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (registerData: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<User>;
    setAuth: (authData: AuthResponse) => void;
    clearAuth: () => void;
    refreshToken: () => Promise<void>;
}, "initializeAuth" | "login" | "register" | "logout" | "getCurrentUser" | "setAuth" | "clearAuth" | "refreshToken">>;
export {};
