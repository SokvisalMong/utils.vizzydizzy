import { parseGIF, decompressFrames } from 'gifuct-js';
import { GIFMetadata, GIFFrameResult, RawGifFrame } from '@/interfaces/gif';

/**
 * Get basic metadata from a GIF file
 */
export async function getGIFMetadata(file: File): Promise<GIFMetadata> {
    const buffer = await file.arrayBuffer();
    const gif = parseGIF(buffer);
    // We don't need to decompress all frames just for metadata if we only need count,
    // but gifuct-js doesn't seem to provide a frame count without parsing frames.
    const frames = decompressFrames(gif, true);
    
    return {
        width: gif.lsd.width,
        height: gif.lsd.height,
        frameCount: frames.length,
        duration: frames.reduce((acc: number, frame: RawGifFrame) => acc + frame.delay, 0)
    };
}

/**
 * Extract all frames from a GIF file as PNG blobs
 * Handles coalescing/disposal methods correctly
 */
export async function extractGIFFrames(
    file: File, 
    onProgress?: (progress: number) => void
): Promise<GIFFrameResult[]> {
    const buffer = await file.arrayBuffer();
    const gif = parseGIF(buffer);
    const frames = decompressFrames(gif, true) as unknown as RawGifFrame[];

    const { width, height } = gif.lsd;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not create canvas context");

    let previousFrameData: ImageData | null = null;
    const results: GIFFrameResult[] = [];

    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        if (onProgress) {
            onProgress(Math.round((i / frames.length) * 100));
        }

        // 1. Handle Disposal Method (from the PREVIOUS frame)
        if (i > 0) {
            const prevFrame = frames[i - 1];
            if (prevFrame.disposalType === 2) {
                // Restore to background (clear the patch area)
                ctx.clearRect(
                    prevFrame.dims.left,
                    prevFrame.dims.top,
                    prevFrame.dims.width,
                    prevFrame.dims.height
                );
            } else if (prevFrame.disposalType === 3) {
                // Restore to previous state
                if (previousFrameData) {
                    ctx.putImageData(previousFrameData, 0, 0);
                }
            }
        }

        // 2. Save current state before drawing if next disposal might be 3
        if (frame.disposalType === 3) {
            previousFrameData = ctx.getImageData(0, 0, width, height);
        }

        // 3. Draw the current frame patch
        // We use a temporary canvas for the patch to handle transparency blending correctly via drawImage
        const patchCanvas = document.createElement('canvas');
        patchCanvas.width = frame.dims.width;
        patchCanvas.height = frame.dims.height;
        const patchCtx = patchCanvas.getContext('2d');
        
        if (patchCtx) {
            const imgData = patchCtx.createImageData(frame.dims.width, frame.dims.height);
            imgData.data.set(frame.patch);
            patchCtx.putImageData(imgData, 0, 0);
            ctx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);
        }

        // 4. Capture the fully formed frame as a Blob
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), "image/png");
        });

        if (blob) {
            results.push({
                index: i,
                blob,
                fileName: `${file.name.replace(/\.[^/.]+$/, "")}_frame_${String(i + 1).padStart(3, '0')}.png`,
                width,
                height,
                delay: frame.delay
            });
        }
    }

    return results;
}
