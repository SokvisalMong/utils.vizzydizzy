export type OutputFormat = "image/webp" | "image/jpeg" | "image/png";

export interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  originalSize: number;
  compressedUrl?: string;
  compressedSize?: number;
  compressedBlob?: Blob;
  outputFormat?: OutputFormat;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

export interface PreviewState {
  url: string;
  title: string;
}

export interface CompressionSettings {
  outputFormat: OutputFormat;
  quality: number;
  targetSizeKB?: number;
}
