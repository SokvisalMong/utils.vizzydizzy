import { GoogleAIGenerationParams, GoogleAIEditParams, GeneratedImageResult } from "@/interfaces/image-generation";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export async function generateImage(apiKey: string, params: GoogleAIGenerationParams): Promise<GeneratedImageResult> {
  const endpoint = `${BASE_URL}/${params.model}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: params.prompt }]
      }
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
      ...(params.sampleCount ? { candidateCount: params.sampleCount } : {}),
      ...(params.aspectRatio ? { 
        imageConfig: { aspectRatio: params.aspectRatio } 
      } : {})
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate image.");
    }

    const data = await response.json();
    
    if (!data.candidates || !Array.isArray(data.candidates)) {
      throw new Error("Invalid response format from Google AI.");
    }

    const base64Images: string[] = [];
    
    data.candidates.forEach((candidate: { content?: { parts?: Array<{ inlineData?: { data?: string } }> } }) => {
      candidate.content?.parts?.forEach((part) => {
        if (part.inlineData && part.inlineData.data) {
          base64Images.push(part.inlineData.data);
        }
      });
    });

    return { base64Images };
  } catch (error: unknown) {
    if (error instanceof Error) return { base64Images: [], error: error.message };
    return { base64Images: [], error: String(error) };
  }
}

export async function editImage(apiKey: string, params: GoogleAIEditParams): Promise<GeneratedImageResult> {
  const endpoint = `${BASE_URL}/${params.model}:generateContent?key=${apiKey}`;

  // For Gemini capability models, the reference images are appended to the parts array alongside the prompt text.
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [{ text: params.prompt }];
  
  params.referenceImages.forEach(ref => {
    parts.push({
      inlineData: {
        // Assume png/jpeg by default depending on input, explicitly setting generic here
        mimeType: "image/jpeg", 
        data: ref.base64Data
      }
    });
  });

  const payload = {
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      ...(params.sampleCount ? { candidateCount: params.sampleCount } : {})
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to edit image.");
    }

    const data = await response.json();
    
    if (!data.candidates || !Array.isArray(data.candidates)) {
      throw new Error("Invalid response format from Google AI.");
    }

    const base64Images: string[] = [];
    
    data.candidates.forEach((candidate: { content?: { parts?: Array<{ inlineData?: { data?: string } }> } }) => {
      candidate.content?.parts?.forEach((part) => {
        if (part.inlineData && part.inlineData.data) {
          base64Images.push(part.inlineData.data);
        }
      });
    });

    return { base64Images };
  } catch (error: unknown) {
    if (error instanceof Error) return { base64Images: [], error: error.message };
    return { base64Images: [], error: String(error) };
  }
}
