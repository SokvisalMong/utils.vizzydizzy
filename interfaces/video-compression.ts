export type VideoStatus = "pending" | "extracting-info" | "processing" | "done" | "error";

export type ResolutionHeight = 1080 | 720 | 480 | 360 | "original";

export type TargetSizeUnit = "MB" | "percentage";

export interface Resolution {
  label: string;
  value: ResolutionHeight;
}

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  bitrate: number;
}

export interface VideoItem {
  id: string;
  file: File;
  previewUrl: string; // URL for original video preview
  originalSize: number;
  compressedUrl?: string; // URL for compressed video preview
  compressedSize?: number;
  compressedBlob?: Blob;
  status: VideoStatus;
  progress: number;
  info?: VideoInfo;
  error?: string;
}

export interface VideoCompressionSettings {
  targetResolution: ResolutionHeight;
  targetSizeValue: number;
  targetSizeUnit: TargetSizeUnit;
  crf: number; // Constant Rate Factor (0-51, lower is better quality)
}
