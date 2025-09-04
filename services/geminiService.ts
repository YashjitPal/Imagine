import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we assume it's set in the environment.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const processImageResponses = (responses: GenerateContentResponse[]): string[] => {
    const images = responses.map(response => {
      // The model can return multiple parts (e.g. text and image). We need to find the image part.
      const imagePart = response.candidates?.[0]?.content?.parts?.find(part => !!part.inlineData);

      if (imagePart?.inlineData) {
        return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
      return null;
    }).filter((img): img is string => img !== null);

    if (images.length === 0) {
        console.error("No images generated from responses:", JSON.stringify(responses, null, 2));
        throw new Error("Failed to generate any images.");
    }

    return images;
}

// FIX: Use the correct `generateImages` method and model for image generation.
export const generateImages = async (prompt: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt,
      config: {
        numberOfImages: 6,
        outputMimeType: 'image/jpeg',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      console.error("No images generated from response:", JSON.stringify(response, null, 2));
      throw new Error("Failed to generate any images.");
    }
    
    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error("Could not generate images from the prompt.");
  }
};

const parseBase64 = (base64String: string) => {
  const match = base64String.match(/^data:(image\/[a-z]+);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid base64 image string');
  }
  return { mimeType: match[1], data: match[2] };
};

export const editImage = async (prompt: string, imageBase64: string): Promise<string[]> => {
  try {
    const { mimeType, data } = parseBase64(imageBase64);

    const imagePart = {
      inlineData: {
        mimeType,
        data,
      },
    };
    const textPart = { text: prompt };

    const imagePromises = Array.from({ length: 6 }).map(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
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
    throw new Error("Could not edit the image with the provided prompt.");
  }
};
