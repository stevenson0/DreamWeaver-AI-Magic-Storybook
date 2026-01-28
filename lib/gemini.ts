
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Story, ImageSize, AspectRatio } from "../types";

/**
 * Generates a full story object with pages and illustration prompts.
 */
export const generateStory = async (prompt: string): Promise<Story> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a magical, high-quality story for children based on this prompt: "${prompt}". 
    The story should be 5 pages long. 
    Each page must have exactly 2-4 sentences of warm, rhythmic narration.
    Each page needs a visual illustration prompt describing a specific scene.
    Style: Whimsical, soft watercolor, vibrant, friendly characters, no text in images.`,
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
                illustrationPrompt: { 
                  type: Type.STRING, 
                  description: "Visual description. Focus on characters and environment. Style: Whimsical Watercolor." 
                }
              },
              required: ["text", "illustrationPrompt"]
            }
          }
        },
        required: ["title", "pages"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No magic found in the wand!");
    return JSON.parse(text);
  } catch (e) {
    console.error("Story weave failed:", e);
    throw new Error("The story sprites got shy. Try again!");
  }
};

/**
 * Generates an image for a specific page.
 */
export const generateIllustration = async (prompt: string, size: ImageSize, ratio: AspectRatio = "3:4"): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A beautiful children's book illustration: ${prompt}. Whimsical watercolor style, soft edges, magical glow, child-friendly, colorful.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: ratio,
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("The paint bucket spilled! Couldn't draw this page.");
};

/**
 * Native Gemini TTS for expressive narration.
 */
export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this story page with a gentle, expressive, and warm storytelling voice: ${text}` }] }],
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
  if (!base64Audio) throw new Error("Voice magic failed.");
  return base64Audio;
};

/**
 * Sparky the magic firefly chatbot.
 */
export const chatWithGemini = async (history: { role: string, text: string }[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are Sparky, a magical firefly that lives in this storybook. You are friendly, bubbly, and love explaining things to kids. Keep answers short (1-2 sentences), use lots of emojis like ✨ 🌟 🪄, and always be encouraging!"
    }
  });

  const lastMessage = history[history.length - 1].text;
  const response = await chat.sendMessage({ message: lastMessage });
  return response.text || "✨ Just fluttering my wings! Ask me something else! ✨";
};
