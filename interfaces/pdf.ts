export interface PDFPageInfo {
    pageNumber: number;
    width: number;
    height: number;
    aspectRatio: number;
}

export interface PDFMetadata {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
    pageCount: number;
}

export interface PDFConversionOptions {
    scale: number;
    quality: number;
}

export interface ConversionResult {
    pageNumber: number;
    blob: Blob;
    fileName: string;
    width: number;
    height: number;
}
