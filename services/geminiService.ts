import { GoogleGenAI, Chat, Part } from "@google/genai";
import type { GroundingSource, GeminiService as IGeminiService, ChatMessage, AttachedImage } from '../types';

const GeminiService = (): IGeminiService => {
  let ai: GoogleGenAI | null = null;
  try {
     if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  } catch(e) {
    console.error("Failed to initialize GoogleGenAI", e);
  }

  const startChat = async (history: ChatMessage[], model: string, useGoogleSearch: boolean): Promise<Chat | null> => {
    if (!ai) return null;
    try {
      const chat = ai.chats.create({
        model: model,
        history: history
          .filter(msg => msg.content || msg.image)
          .map(msg => {
            const parts: Part[] = [];
            if (msg.content) {
              parts.push({ text: msg.content });
            }
            if (msg.image) {
              parts.push({
                inlineData: {
                  mimeType: msg.image.mimeType,
                  data: msg.image.data,
                },
              });
            }
            return {
              role: msg.role,
              parts: parts,
            };
          }),
        config: {
          tools: useGoogleSearch ? [{ googleSearch: {} }] : [],
        },
      });
      return chat;
    } catch (error) {
      console.error("Error starting chat session:", error);
      return null;
    }
  };

  const sendMessage = async (
    chat: Chat,
    message: string,
    image: AttachedImage | null,
    onChunk: (chunk: string) => void,
    onSources: (sources: GroundingSource[]) => void
  ): Promise<string> => {
    // The try/catch block is now handled by the calling component (ChatView)
    // for more direct UI-level error handling. This function will now throw on error.
    let fullText = "";
    
    const parts: (string | Part)[] = [];
    if (message) {
      parts.push(message);
    }
    if (image) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    if (parts.length === 0) {
      console.error("sendMessage was called with no content.");
      // Throw an error to be caught by the UI component.
      throw new Error("Cannot send an empty message.");
    }

    // Fix: The `chat.sendMessageStream` method expects a `SendMessageParameters` object. The `parts` array should be passed as the `message` property of this object.
    const result = await chat.sendMessageStream({ message: parts });

    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
      
      const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        const sources: GroundingSource[] = groundingMetadata.groundingChunks
          .map((c: any) => ({
            uri: c.web?.uri || '',
            title: c.web?.title || 'Untitled',
          }))
          .filter((s: GroundingSource) => s.uri);
        if (sources.length > 0) {
          onSources(sources);
        }
      }
    }
    
    return fullText;
  };

  const enhanceText = async (text: string): Promise<string> => {
    if (!ai) return "AI service is not available.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Use a fast model for this task
        contents: `Please enhance and rephrase the following text to be more detailed, clear, and professional. Return only the enhanced text, without any introductory phrases like "Here is the enhanced text:":\n\n"${text}"`,
      });
      return response.text.trim();
    } catch (error) {
      console.error("Error enhancing text:", error);
      return `Error: Could not enhance text.`;
    }
  };

  return {
    startChat,
    sendMessage,
    enhanceText,
  };
};

export const geminiService = GeminiService();