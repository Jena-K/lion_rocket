import type { Character, CharacterCreate, CharacterUpdate, CharacterListResponse } from '@/types';
export type { Character, CharacterCreate, CharacterUpdate };
export declare class AdminCharacterService {
    /**
     * Get all characters with filters (Admin only)
     */
    getCharacters(params?: {
        skip?: number;
        limit?: number;
        search?: string;
        is_active?: boolean;
    }): Promise<CharacterListResponse>;
    /**
     * Create a new character (Admin only)
     */
    createCharacter(data: CharacterCreate): Promise<Character>;
    /**
     * Update a character (Admin only)
     */
    updateCharacter(characterId: number, data: CharacterUpdate): Promise<Character>;
    /**
     * Toggle character active status (Admin only)
     */
    toggleActive(characterId: number): Promise<{
        message: string;
        is_active: boolean;
    }>;
    /**
     * Delete a character (Admin only)
     */
    deleteCharacter(characterId: number): Promise<{
        message: string;
    }>;
    /**
     * Upload character avatar (Admin only)
     */
    uploadAvatar(characterId: number, file: File): Promise<{
        avatar_url: string;
        message: string;
    }>;
    /**
     * Delete character avatar (Admin only)
     */
    deleteAvatar(characterId: number): Promise<{
        message: string;
    }>;
    /**
     * Get character statistics (Admin only)
     */
    getCharacterStats(): Promise<any>;
}
export declare const adminCharacterService: AdminCharacterService;
