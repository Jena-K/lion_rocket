/**
 * Avatar Service - avatar_url을 사용하여 이미지 표시
 * 백엔드에서 받은 avatar_url을 사용하여 /images/avatars/{avatar_url} 형식으로 이미지 표시
 */
// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export class AvatarService {
    /**
     * Generate full avatar image URL from avatar_url
     * Uses the new /images/avatars/{avatar_url} endpoint
     */
    static getAvatarUrl(avatarUrl) {
        if (!avatarUrl) {
            return null;
        }
        // If avatarUrl is already a full URL, return as is
        if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
            return avatarUrl;
        }
        // Generate URL using the backend's /images/avatars/{avatar_url} endpoint
        return `${API_BASE_URL}/images/avatars/${avatarUrl}`;
    }
    /**
     * Get placeholder avatar based on character data
     */
    static getPlaceholderAvatar(character) {
        // Return the first letter of the character name as fallback
        return character.name.charAt(0).toUpperCase();
    }
    /**
     * Get placeholder avatar based on user data
     */
    static getUserPlaceholderAvatar(user) {
        // Return the first letter of the username as fallback
        return user.username.charAt(0).toUpperCase();
    }
    /**
     * Handle avatar loading error by setting fallback
     */
    static handleAvatarError(event) {
        const imgElement = event.target;
        if (imgElement) {
            const src = imgElement.src;
            console.warn(`Avatar image failed to load: ${src}`);
            // Hide the broken image
            imgElement.style.display = 'none';
            // Find the placeholder element and show it
            const avatarContainer = imgElement.closest('.avatar, .character-avatar, .modal-avatar');
            const placeholder = avatarContainer?.querySelector('.avatar-placeholder, .avatar-large');
            if (placeholder && placeholder instanceof HTMLElement) {
                placeholder.style.display = 'flex';
            }
        }
    }
}
// Export singleton methods for easier usage
export const { getAvatarUrl, getPlaceholderAvatar, getUserPlaceholderAvatar, handleAvatarError, } = AvatarService;
