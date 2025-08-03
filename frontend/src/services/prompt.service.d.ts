export interface Prompt {
    id: number;
    name: string;
    prompt_text: string;
    created_at: string;
    updated_at: string;
}
export interface PromptCreate {
    name: string;
    prompt_text: string;
}
export interface PromptUpdate {
    name?: string;
    prompt_text?: string;
}
export declare const promptService: {
    getPrompts(): Promise<Prompt[]>;
    createPrompt(data: PromptCreate): Promise<Prompt>;
    updatePrompt(id: number, data: PromptUpdate): Promise<Prompt>;
    deletePrompt(id: number): Promise<void>;
};
