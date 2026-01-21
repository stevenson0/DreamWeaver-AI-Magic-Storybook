
export type ImageSize = '1K' | '2K' | '4K';

export interface StoryPage {
  text: string;
  illustrationPrompt: string;
  imageUrl?: string;
}

export interface Story {
  title: string;
  pages: StoryPage[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

declare global {
  /**
   * Interface for the AI Studio global object.
   * Moved inside declare global to ensure it matches the existing global scope.
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Removed readonly to match the existing global property definition and avoid modifier conflict.
    aistudio: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }
}
