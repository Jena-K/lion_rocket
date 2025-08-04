/**
 * Avatar Service - avatar_url을 사용하여 이미지 표시
 * 백엔드에서 받은 avatar_url을 사용하여 /images/avatars/{avatar_url} 형식으로 이미지 표시
 */
export declare class AvatarService {
    /**
     * Generate full avatar image URL from avatar_url
     * Uses the new /images/avatars/{avatar_url} endpoint
     */
    static getAvatarUrl(avatarUrl: string | undefined | null): string | null;
    /**
     * Get placeholder avatar based on character data
     */
    static getPlaceholderAvatar(character: {
        name: string;
        gender?: string;
    }): string;
    /**
     * Get placeholder avatar based on user data
     */
    static getUserPlaceholderAvatar(user: {
        username: string;
    }): string;
    /**
     * Handle avatar loading error by setting fallback
     */
    static handleAvatarError(event: Event): void;
}
export declare const getAvatarUrl: typeof AvatarService.getAvatarUrl, getPlaceholderAvatar: typeof AvatarService.getPlaceholderAvatar, getUserPlaceholderAvatar: typeof AvatarService.getUserPlaceholderAvatar, handleAvatarError: typeof AvatarService.handleAvatarError;
