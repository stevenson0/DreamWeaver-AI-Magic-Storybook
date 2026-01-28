
export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

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
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fixed: Made aistudio optional to match global environment definitions and fix "identical modifiers" error
    aistudio?: AIStudio;
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
