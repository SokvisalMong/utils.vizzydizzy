"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ImagePreviewDialogProps {
    image?: string | File | null;
    title?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ImagePreviewDialog({
    image,
    title,
    open,
    onOpenChange,
}: ImagePreviewDialogProps) {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [prevImage, setPrevImage] = useState<string | File | null | undefined>(null);

    if (image !== prevImage) {
        setPrevImage(image);
        if (!(image instanceof File)) {
            setFileUrl(null);
        }
    }

    useEffect(() => {
        if (image instanceof File) {
            const url = URL.createObjectURL(image);
            const timeout = setTimeout(() => setFileUrl(url), 0);
            return () => {
                clearTimeout(timeout);
                URL.revokeObjectURL(url);
            };
        }
    }, [image]);

    const previewUrl = typeof image === "string" ? image : fileUrl;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none bg-black/90 backdrop-blur-md">
                <DialogHeader className="p-4 bg-background/50 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
                    <DialogTitle className="text-sm font-medium text-white truncate max-w-[80%]">
                        {title || (image instanceof File ? image.name : "Image Preview")}
                    </DialogTitle>
                </DialogHeader>
                <div className="p-2 md:p-6 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative min-h-[400px]">
                    {previewUrl && (
                        <div className="relative w-full h-full min-h-[400px]">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                fill
                                unoptimized
                                className="object-contain p-4 drop-shadow-2xl"
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
