import * as pdfjsLib from "pdfjs-dist";
import { PDFMetadata, PDFPageInfo, ConversionResult, PDFConversionOptions } from "@/interfaces/pdf";

// Configure worker locally to avoid CDN issues
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFJSInfo {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
}

export async function getPDFMetadata(file: File): Promise<PDFMetadata> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const metadata = await pdf.getMetadata();

    const info = metadata.info as PDFJSInfo;

    return {
        title: info?.Title,
        author: info?.Author,
        subject: info?.Subject,
        keywords: info?.Keywords,
        creator: info?.Creator,
        producer: info?.Producer,
        pageCount: pdf.numPages,
    };
}

export async function getPDFPagesInfo(file: File): Promise<PDFPageInfo[]> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pagesInfo: PDFPageInfo[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        pagesInfo.push({
            pageNumber: i,
            width: viewport.width,
            height: viewport.height,
            aspectRatio: viewport.width / viewport.height,
        });
    }

    return pagesInfo;
}

export async function convertPageToImage(
    file: File,
    pageNumber: number,
    options: PDFConversionOptions
): Promise<ConversionResult> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale: options.scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Could not get canvas context");
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas,
    } as unknown as Parameters<typeof page.render>[0]).promise;

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Canvas to Blob conversion failed"));
                    return;
                }
                resolve({
                    pageNumber,
                    blob,
                    fileName: `${file.name.replace(/\.[^/.]+$/, "")}_page_${pageNumber}.png`,
                    width: viewport.width,
                    height: viewport.height,
                });
            },
            "image/png",
            options.quality
        );
    });
}
