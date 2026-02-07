"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { IconFileTypePng, IconLoader2, IconX, IconCheck, IconZip, IconDownload } from "@tabler/icons-react";
import JSZip from "jszip";
import { PDFDropzone } from "./pdf-dropzone";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { getPDFMetadata, convertPageToImage } from "@/utils/pdf-processing";
import { PDFMetadata, ConversionResult } from "@/interfaces/pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function PDFToImageConverter() {
    const [file, setFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<ConversionResult[]>([]);
    const [isDone, setIsDone] = useState(false);
    const [previewImage, setPreviewImage] = useState<ConversionResult | null>(null);

    const handleFileSelected = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setResults([]);
        setIsDone(false);
        setProgress(0);
        try {
            const meta = await getPDFMetadata(selectedFile);
            setMetadata(meta);
        } catch (error) {
            console.error("Error reading PDF metadata:", error);
        }
    }, []);

    const handleReset = useCallback(() => {
        setFile(null);
        setMetadata(null);
        setResults([]);
        setIsDone(false);
        setProgress(0);
    }, []);

    const startConversion = async () => {
        if (!file || !metadata) return;

        setIsProcessing(true);
        setProgress(0);
        const newResults: ConversionResult[] = [];

        try {
            for (let i = 1; i <= metadata.pageCount; i++) {
                const result = await convertPageToImage(file, i, { scale: 2, quality: 1 });
                newResults.push(result);
                setProgress(Math.round((i / metadata.pageCount) * 100));
            }
            setResults(newResults);
            setIsDone(true);
        } catch (error) {
            console.error("Conversion failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadAllAsZip = async () => {
        if (results.length === 0) return;

        const zip = new JSZip();
        results.forEach((res) => {
            zip.file(res.fileName, res.blob);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${file?.name.replace(/\.[^/.]+$/, "")}_images.zip`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadIndividual = (res: ConversionResult) => {
        const url = URL.createObjectURL(res.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = res.fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!file) {
        return <PDFDropzone onFileSelected={handleFileSelected} />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-muted-foreground/20 bg-background/40 backdrop-blur-sm rounded-none border-t-4 border-t-orange-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center space-x-4">
                        <div className="bg-orange-500/10 p-2 text-orange-500">
                            <IconFileTypePng size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold truncate max-w-[300px]">
                                {file.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB • {metadata?.pageCount} Pages
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="hover:bg-destructive/10 hover:text-destructive rounded-none"
                    >
                        <IconX size={20} />
                    </Button>
                </CardHeader>

                <CardContent className="pt-4">
                    {!isProcessing && !isDone && (
                        <div className="py-6 text-center">
                            <p className="text-muted-foreground mb-6">
                                Ready to convert {metadata?.pageCount} pages to PNG.
                            </p>
                            <Button
                                onClick={startConversion}
                                className="w-full md:w-auto px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-none"
                            >
                                Start Conversion
                            </Button>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="py-6 space-y-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="flex items-center gap-2">
                                    <IconLoader2 className="animate-spin" size={16} />
                                    Processing pages...
                                </span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2 rounded-none bg-orange-500/20" />
                        </div>
                    )}

                    {isDone && (
                        <div className="py-4 space-y-6">
                            <div className="flex items-center gap-2 text-green-500 font-medium bg-green-500/10 p-3">
                                <IconCheck size={20} />
                                Conversion Complete! {results.length} images generated.
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {results.map((res) => {
                                    // Normally we should manage these URLs to avoid leaks, 
                                    // but for simplicity in this browser-only tool:
                                    const objectUrl = URL.createObjectURL(res.blob);

                                    return (
                                        <div
                                            key={res.pageNumber}
                                            className="relative group aspect-[3/4] bg-muted/30 border border-muted-foreground/10 overflow-hidden cursor-pointer"
                                            onClick={() => setPreviewImage(res)}
                                        >
                                            <Image
                                                src={objectUrl}
                                                alt={`Page ${res.pageNumber}`}
                                                width={res.width}
                                                height={res.height}
                                                className="object-contain w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                                unoptimized
                                            />
                                            <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 text-[10px] text-white flex items-center justify-between px-2">
                                                <span>Page {res.pageNumber}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadIndividual(res);
                                                    }}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    <IconDownload size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>

                {isDone && (
                    <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-muted-foreground/10">
                        <Button
                            onClick={downloadAllAsZip}
                            className="w-full sm:flex-1 bg-primary hover:bg-primary/90 rounded-none h-11"
                        >
                            <IconZip size={20} className="mr-2" />
                            Download All as ZIP
                        </Button>
                        <Separator orientation="vertical" className="hidden sm:block h-11" />
                        <p className="text-[10px] text-muted-foreground italic text-center sm:text-left">
                            High-quality PNG exports (200% scale)
                        </p>
                    </CardFooter>
                )}
            </Card>

            <ImagePreviewDialog
                open={!!previewImage}
                onOpenChange={(open) => !open && setPreviewImage(null)}
                image={previewImage ? new File([previewImage.blob], previewImage.fileName, { type: "image/png" }) : null}
                title={previewImage?.fileName}
            />
        </div>
    );
}
