import type { Character, CharacterCreate, CharacterUpdate } from '@/types/character';
export declare class CharacterService {
    /**
     * Create a new character
     */
    createCharacter(data: CharacterCreate): Promise<Character>;
    /**
     * Get list of characters
     */
    getCharacters(params?: {
        skip?: number;
        limit?: number;
        search?: string;
        category?: string;
        include_private?: boolean;
    }): Promise<{
        characters: Character[];
        total: number;
    }>;
    /**
     * Get user's own characters
     */
    getMyCharacters(params?: {
        skip?: number;
        limit?: number;
    }): Promise<{
        characters: Character[];
        total: number;
    }>;
    /**
     * Get a specific character
     */
    getCharacter(characterId: number): Promise<Character>;
    /**
     * Update a character
     */
    updateCharacter(characterId: number, data: CharacterUpdate): Promise<Character>;
    /**
     * Delete a character
     */
    deleteCharacter(characterId: number): Promise<void>;
    /**
     * Upload character avatar
     */
    uploadAvatar(characterId: number, file: File): Promise<{
        avatar_url: string;
    }>;
}
export declare const characterService: CharacterService;
export type { Character, CharacterCreate, CharacterUpdate };
