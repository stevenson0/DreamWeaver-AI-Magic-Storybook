
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
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fixed: Added 'readonly' modifier to match the global declaration provided by the environment
    readonly aistudio: AIStudio;
    webkitAudioContext: typeof AudioContext;
  }

  namespace NodeJS {
    interface Process {
      env: ProcessEnv;
    }
    interface ProcessEnv {
      API_KEY?: string;
    }
  }
}