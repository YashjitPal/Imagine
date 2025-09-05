
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { Model } from '../App';

const getClient = (apiKey?: string | null) => {
  const keyToUse = apiKey || process.env.API_KEY;
  if (!keyToUse) {
    throw new Error("API key is missing. Please configure it in the settings or as an environment variable.");
  }
  return new GoogleGenAI({ apiKey: keyToUse });
};

export interface GenerationSettings {
    apiKey?: string | null;
    numberOfImages: number;
    model: Model;
}

const processImageResponses = (responses: GenerateContentResponse[]): string[] => {
    const images: string[] = [];
    for (const response of responses) {
        if (response.candidates) {
            for (const candidate of response.candidates) {
                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData) {
                            images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
                        }
                    }
                }
            }
        }
    }

    if (images.length === 0) {
        console.error("No images generated from responses:", JSON.stringify(responses, null, 2));
        throw new Error("Failed to generate any images from the model's response.");
    }
    return images;
}

export const generateImages = async (prompt: string, settings: GenerationSettings): Promise<string[]> => {
  try {
    const ai = getClient(settings.apiKey);

    if (settings.model === 'imagen-4.0-generate-001') {
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt,
          config: {
            numberOfImages: settings.numberOfImages,
            outputMimeType: 'image/jpeg',
          },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
          throw new Error("The API did not return any images.");
        }
        
        return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } else {
        // Handle 'gemini-2.5-flash-image-preview' for text-to-image
        // Use a system instruction to force image generation mode.
        const imagePromises = Array.from({ length: settings.numberOfImages }).map(() =>
            ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    systemInstruction: "You are an image generation model. Given a prompt, you must generate an image. Do not respond with text, only with an image.",
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            })
        );
        const responses = await Promise.all(imagePromises);
        return processImageResponses(responses);
    }
  } catch (error) {
    console.error("Error generating images:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Could not generate images: ${errorMessage}`);
  }
};

const parseBase64 = (base64String: string) => {
  const match = base64String.match(/^data:(image\/[a-z]+);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid base64 image string');
  }
  return { mimeType: match[1], data: match[2] };
};

export const generateWithImages = async (prompt: string, imagesBase64: string[], settings: GenerationSettings): Promise<string[]> => {
  try {
    const ai = getClient(settings.apiKey);

    const imageParts = imagesBase64.map(base64String => {
        const { mimeType, data } = parseBase64(base64String);
        return { inlineData: { mimeType, data } };
    });

    const textPart = { text: prompt };
    const allParts = [...imageParts, textPart];

    const imagePromises = Array.from({ length: settings.numberOfImages }).map(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview', // Editing always uses this model
        contents: { parts: allParts },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      })
    );
    
    const responses = await Promise.all(imagePromises);
    return processImageResponses(responses);

  } catch (error) {
    console.error("Error generating with images:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Could not generate images with context: ${errorMessage}`);
  }
};
