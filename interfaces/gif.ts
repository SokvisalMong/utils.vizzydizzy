export interface GIFMetadata {
    width: number;
    height: number;
    frameCount: number;
    duration?: number;
}

export interface GIFFrameResult {
    index: number;
    blob: Blob;
    fileName: string;
    width: number;
    height: number;
    delay: number;
}

export interface GIFSplitOptions {
    format: "png"; // For now only PNG as requested
}

// Minimal types for gifuct-js since @types/gifuct-js is missing
export interface RawGifFrame {
    dims: {
        width: number;
        height: number;
        left: number;
        top: number;
    };
    patch: Uint8ClampedArray;
    disposalType: number;
    delay: number;
}

export interface RawGif {
    frames: RawGifFrame[];
    lsd: {
        width: number;
        height: number;
    };
}
