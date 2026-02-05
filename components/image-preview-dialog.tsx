"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

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
            <DialogContent
                showCloseButton={false}
                className="max-w-[calc(100%-2rem)] sm:max-w-5xl lg:max-w-7xl p-0 overflow-hidden border-none bg-black/90 backdrop-blur-md max-h-[90vh] flex flex-col !gap-0"
            >
                <DialogHeader className="p-4 bg-background/50 border-b border-white/10 flex flex-row items-center justify-between shrink-0 gap-4">
                    <DialogTitle className="text-sm font-medium text-white truncate min-w-0 flex-1">
                        {title || (image instanceof File ? image.name : "Image Preview")}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <DialogDescription className="sr-only">
                            Preview of the selected image.
                        </DialogDescription>
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-white/50 hover:text-white hover:bg-white/10"
                            >
                                <IconX size={16} />
                                <span className="sr-only">Close</span>
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>
                <div className="p-2 md:p-6 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative min-h-[400px]">
                    {previewUrl && (
                        <div className="relative w-full h-[60vh] min-h-[400px]">
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
