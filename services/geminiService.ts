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
    const images = responses.map(response => {
      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => !!part.inlineData);
      if (imagePart?.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      return null;
    }).filter((img): img is string => img !== null);

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
        // Prepend an instruction to ensure the model understands the intent is image generation.
        const imageGenerationPrompt = `Generate an image of ${prompt}`;
        
        const imagePromises = Array.from({ length: settings.numberOfImages }).map(() =>
            ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [{ text: imageGenerationPrompt }] },
                config: {
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

export const editImage = async (prompt: string, imageBase64: string, settings: GenerationSettings): Promise<string[]> => {
  try {
    const { mimeType, data } = parseBase64(imageBase64);
    const ai = getClient(settings.apiKey);

    const imagePart = {
      inlineData: {
        mimeType,
        data,
      },
    };
    const textPart = { text: prompt };

    const imagePromises = Array.from({ length: settings.numberOfImages }).map(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview', // Editing always uses this model
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      })
    );
    
    const responses = await Promise.all(imagePromises);
    return processImageResponses(responses);

  } catch (error) {
    console.error("Error editing image:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Could not edit the image: ${errorMessage}`);
  }
};