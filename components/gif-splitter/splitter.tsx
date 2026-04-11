"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { IconLoader2, IconX, IconCheck, IconZip, IconDownload, IconGif } from "@tabler/icons-react";
import JSZip from "jszip";
import { GIFDropzone } from "./gif-dropzone";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { getGIFMetadata, extractGIFFrames } from "@/utils/gif-processing";
import type { GIFMetadata, GIFFrameResult } from "@/interfaces/gif";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function GIFSplitter() {
    const [file, setFile] = useState<File | null>(null);
    const [metadata, setMetadata] = useState<GIFMetadata | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<GIFFrameResult[]>([]);
    const [isDone, setIsDone] = useState(false);
    const [previewImage, setPreviewImage] = useState<GIFFrameResult | null>(null);

    const handleFileSelected = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setResults([]);
        setIsDone(false);
        setProgress(0);
        try {
            const meta = await getGIFMetadata(selectedFile);
            setMetadata(meta);
        } catch (error) {
            console.error("Error reading GIF metadata:", error);
        }
    }, []);

    const handleReset = useCallback(() => {
        setFile(null);
        setMetadata(null);
        setResults([]);
        setIsDone(false);
        setProgress(0);
    }, []);

    const startSplitting = async () => {
        if (!file) return;

        setIsProcessing(true);
        setProgress(0);

        try {
            const newResults = await extractGIFFrames(file, (p) => setProgress(p));
            setResults(newResults);
            setIsDone(true);
        } catch (error) {
            console.error("Splitting failed:", error);
        } finally {
            setIsProcessing(false);
            setProgress(100);
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
        link.download = `${file?.name.replace(/\.[^/.]+$/, "")}_frames.zip`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const downloadIndividual = (res: GIFFrameResult) => {
        const url = URL.createObjectURL(res.blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = res.fileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (!file) {
        return <GIFDropzone onFileSelected={handleFileSelected} />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-muted-foreground/20 bg-background/40 backdrop-blur-sm rounded-none border-t-4 border-t-green-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-500/10 p-2 text-green-500">
                            <IconGif size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold truncate max-w-[300px]">
                                {file.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB • {metadata?.frameCount} Frames
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
                                Ready to split {metadata?.frameCount} frames to PNG.
                            </p>
                            <Button
                                onClick={startSplitting}
                                className="w-full md:w-auto px-8 bg-green-600 hover:bg-green-700 text-white rounded-none"
                            >
                                Start Splitting
                            </Button>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="py-6 space-y-4">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="flex items-center gap-2">
                                    <IconLoader2 className="animate-spin" size={16} />
                                    Extracting frames...
                                </span>
                                <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2 rounded-none bg-green-500/20" />
                        </div>
                    )}

                    {isDone && (
                        <div className="py-4 space-y-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-green-500/10 p-3">
                                <div className="flex items-center gap-2 text-green-500 font-medium">
                                    <IconCheck size={20} />
                                    Splitting Complete! {results.length} frames generated.
                                </div>
                                <Button
                                    onClick={downloadAllAsZip}
                                    size="sm"
                                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-none h-9"
                                >
                                    <IconZip size={18} className="mr-2" />
                                    Download All as ZIP
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {results.map((res) => {
                                    const objectUrl = URL.createObjectURL(res.blob);

                                    return (
                                        <div
                                            key={res.index}
                                            className="relative group aspect-square bg-muted/30 border border-muted-foreground/10 overflow-hidden cursor-pointer"
                                            onClick={() => setPreviewImage(res)}
                                        >
                                            <Image
                                                src={objectUrl}
                                                alt={`Frame ${res.index + 1}`}
                                                width={res.width}
                                                height={res.height}
                                                className="object-contain w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                                unoptimized
                                            />
                                            <div className="absolute inset-x-0 bottom-0 p-1 bg-black/60 text-[10px] text-white flex items-center justify-between px-2">
                                                <span>Frame {res.index + 1}</span>
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
