
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, ImageSize } from "../types";

export const generateStory = async (prompt: string): Promise<Story> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a magical story for children based on this prompt: "${prompt}". 
    The story should be 4-6 pages long. 
    Each page should have a short narration (2-3 sentences) and a detailed illustration prompt.
    The response must be in valid JSON format matching the schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                illustrationPrompt: { type: Type.STRING, description: "Detailed description for an image generator including style (storybook, oil painting, watercolor etc)" }
              },
              required: ["text", "illustrationPrompt"]
            }
          }
        },
        required: ["title", "pages"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateIllustration = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A beautiful, colorful, kid-friendly storybook illustration of: ${prompt}. Cinematic lighting, magical atmosphere.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this story page with a warm, friendly, storytelling voice: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio generated");
  return base64Audio;
};

export const chatWithGemini = async (history: { role: string, text: string }[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are Sparky, a friendly magic storybook companion. You help kids understand stories, answer their questions with imagination and kindness, and encourage curiosity. Keep your answers simple and engaging."
    }
  });

  // Since chat.sendMessage only accepts 'message', we take the last message
  const lastMessage = history[history.length - 1].text;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text || "I'm not sure what to say, but I'm here!";
};
