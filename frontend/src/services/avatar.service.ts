/**
 * Avatar Service - avatar_url을 사용하여 이미지 표시
 * 백엔드에서 받은 avatar_url을 사용하여 /images/avatars/{avatar_url} 형식으로 이미지 표시
 */

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class AvatarService {
  /**
   * Generate full avatar image URL from avatar_url
   * Uses the new /images/avatars/{avatar_url} endpoint
   */
  static getAvatarUrl(avatarUrl: string | undefined | null): string | null {
    if (!avatarUrl) {
      return null
    }

    // If avatarUrl is already a full URL, return as is
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl
    }

    // Generate URL using the backend's /images/avatars/{avatar_url} endpoint
    return `${API_BASE_URL}/images/avatars/${avatarUrl}`
  }


  /**
   * Get placeholder avatar based on character data
   */
  static getPlaceholderAvatar(character: { name: string; gender?: string }): string {
    // Return the first letter of the character name as fallback
    return character.name.charAt(0).toUpperCase()
  }

  /**
   * Handle avatar loading error by setting fallback
   */
  static handleAvatarError(event: Event) {
    const imgElement = event.target as HTMLImageElement
    if (imgElement) {
      const src = imgElement.src
      console.warn(`Avatar image failed to load: ${src}`)
      
      // Hide the broken image
      imgElement.style.display = 'none'
      
      // Find the placeholder element and show it
      const avatarContainer = imgElement.closest('.avatar, .character-avatar, .modal-avatar')
      const placeholder = avatarContainer?.querySelector('.avatar-placeholder, .avatar-large')
      if (placeholder && placeholder instanceof HTMLElement) {
        placeholder.style.display = 'flex'
      }
    }
  }

  /**
   * Check if an avatar URL is valid and accessible
   */
  static async validateAvatarUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      return response.ok
    } catch (error) {
      console.warn('Avatar URL validation failed:', url, error)
      return false
    }
  }

  /**
   * Preload avatar image to check if it exists
   */
  static preloadAvatar(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
    })
  }
}

// Export singleton methods for easier usage
export const {
  getAvatarUrl,
  getPlaceholderAvatar,
  handleAvatarError,
  validateAvatarUrl,
  preloadAvatar
} = AvatarService