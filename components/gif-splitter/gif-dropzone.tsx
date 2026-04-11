"use client";

import React, { useCallback, useRef, useState } from "react";
import { IconUpload, IconGif } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GIFDropzoneProps {
    onFileSelected: (file: File) => void;
    className?: string;
}

export function GIFDropzone({
    onFileSelected,
    className,
}: GIFDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const file = Array.from(e.dataTransfer.files).find((f) =>
                f.type === "image/gif" || f.name.toLowerCase().endsWith(".gif")
            );

            if (file) {
                onFileSelected(file);
            }
        },
        [onFileSelected],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                onFileSelected(file);
            }
            if (fileInputRef.current) fileInputRef.current.value = "";
        },
        [onFileSelected],
    );

    return (
        <div
            className={cn(
                "relative border-2 border-dashed transition-all duration-200",
                "bg-background/40 backdrop-blur-sm",
                isDragging
                    ? "border-green-500 bg-green-500/5 scale-[1.01]"
                    : "border-muted-foreground/20 hover:border-green-500/50 hover:bg-green-500/5",
                "rounded-none",
                className,
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".gif,image/gif"
                className="hidden"
            />

            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="mb-4 bg-green-500/10 p-4 text-green-500">
                    <IconGif size={32} />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Upload GIF
                </h3>
                <p className="mb-6 text-sm text-muted-foreground max-w-[280px]">
                    Drag and drop your GIF file here, or click to browse.
                    Each frame will be exported as a PNG image.
                </p>

                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="secondary"
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-none rounded-none"
                >
                    <IconUpload size={18} className="mr-2" />
                    Select GIF File
                </Button>
            </div>
        </div>
    );
}
