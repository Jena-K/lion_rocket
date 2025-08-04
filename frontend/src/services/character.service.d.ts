import type { Character, CharacterCreate, CharacterUpdate, CharacterListResponse, CharacterSelectionResponse } from '@/types';
export type { Character, CharacterCreate, CharacterUpdate, CharacterListResponse, CharacterSelectionResponse };
export declare class CharacterService {
    /**
     * Create a new character
     */
    createCharacter(data: CharacterCreate): Promise<Character>;
    /**
     * Get list of characters (user's own characters)
     */
    getCharacters(params?: {
        skip?: number;
        limit?: number;
        search?: string;
    }): Promise<CharacterListResponse>;
    /**
     * Get list of available characters for selection
     */
    getAvailableCharacters(params?: {
        skip?: number;
        limit?: number;
        search?: string;
    }): Promise<CharacterListResponse>;
    /**
     * Get the currently active character
     */
    getActiveCharacter(): Promise<Character>;
    /**
     * Select a character as active
     */
    selectCharacter(characterId: number): Promise<CharacterSelectionResponse>;
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
