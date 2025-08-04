/**
 * Avatar Service - Handles avatar URL generation and management
 */

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class AvatarService {
  /**
   * Generate full avatar URL from relative path
   */
  static getAvatarUrl(avatarPath: string | undefined | null): string | null {
    if (!avatarPath) {
      return null
    }

    // If avatarPath is already a full URL, return as is
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath
    }

    // If avatarPath starts with /, it's already a relative path from root
    if (avatarPath.startsWith('/')) {
      return `${API_BASE_URL}${avatarPath}`
    }

    // Otherwise, add the slash prefix
    return `${API_BASE_URL}/${avatarPath}`
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
  validateAvatarUrl,
  getPlaceholderAvatar,
  handleAvatarError,
  preloadAvatar
} = AvatarService