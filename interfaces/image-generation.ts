export interface GoogleAIGenerationParams {
  model: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  sampleCount: number;
}

export interface EditReferenceImage {
  referenceType: "REFERENCE_TYPE_RAW" | "REFERENCE_TYPE_MASK";
  referenceId: number;
  base64Data: string; // The base64 encoded string of the image
}

export interface GoogleAIEditParams {
  model: string;
  prompt: string;
  negativePrompt?: string;
  editMode: "EDIT_MODE_INPAINT_INSERTION" | "EDIT_MODE_INPAINT_REMOVAL" | "EDIT_MODE_BGSWAP" | "EDIT_MODE_OUTPAINT";
  sampleCount: number;
  referenceImages: EditReferenceImage[];
}

export type GenerativeMode = "generate" | "edit";

export interface GeneratedImageResult {
  base64Images: string[]; // Output images as Base64 encoded strings
  error?: string;
}
