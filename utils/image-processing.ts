import type { OutputFormat } from "@/interfaces/image-compression";

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(2)} ${sizes[i]}`;
}

export function buildDownloadName(
  originalName: string,
  format: OutputFormat,
): string {
  const base = originalName.replace(/\.[^/.]+$/, "");
  const ext =
    format === "image/webp"
      ? "webp"
      : format === "image/png"
        ? "png"
        : "jpg";
  return `${base}.${ext}`;
}

export async function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

export function createCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context is not supported in this browser.");
  }
  ctx.drawImage(img, 0, 0);
  return canvas;
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: OutputFormat,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas appears to be empty."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

/**
 * Compress a single image using:
 * - `mimeType` as the output type
 * - `quality` (0–1) as base quality
 * - optional `targetSizeKB` (binary search on quality to approximate size)
 */
export async function compressImageFile(
  file: File,
  mimeType: OutputFormat,
  quality: number,
  targetSizeKB?: number,
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = createCanvas(img);

  const safeQuality = Math.min(Math.max(quality, 0.1), 1);

  if (targetSizeKB && targetSizeKB > 0) {
    const targetBytes = targetSizeKB * 1024;
    let minQ = 0.01;
    let maxQ = 1.0;
    let bestBlob: Blob | null = null;

    // Simple binary search over quality to approximate target size
    for (let i = 0; i < 8; i++) {
      const currentQ = (minQ + maxQ) / 2;
      const blob = await canvasToBlob(canvas, mimeType, currentQ);

      if (blob.size > targetBytes) {
        maxQ = currentQ;
      } else {
        minQ = currentQ;
        bestBlob = blob;
      }
    }

    if (bestBlob) {
      return bestBlob;
    }

    // If we couldn't find a blob under the target size, try the lowest quality
    return canvasToBlob(canvas, mimeType, 0.01);
  }

  // Quality-only mode
  return canvasToBlob(canvas, mimeType, safeQuality);
}
