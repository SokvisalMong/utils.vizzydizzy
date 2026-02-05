"use client";

import React, { useRef, useState } from "react";
import { IconUpload } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
    onFilesSelected: (files: File[]) => void;
}

export function ImageDropzone({ onFilesSelected }: ImageDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilesSelected(Array.from(event.target.files || []));
        event.target.value = "";
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files || []);
        onFilesSelected(files.filter((f) => f.type.startsWith("image/")));
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    return (
        <div className="space-y-4">
            <Label className="text-sm font-semibold">Upload Images</Label>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative group cursor-pointer flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 min-h-[160px] p-6 text-center",
                    isDragging
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                        : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/50"
                )}
            >
                <div className="p-2  bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                    <IconUpload size={28} />
                </div>
                <p className="mt-4 text-sm font-medium">
                    {isDragging ? "Drop your images here" : "Click or drag images to upload"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Supports PNG, JPEG, WebP, AVIF
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesSelected}
                    className="hidden"
                />
            </div>
        </div>
    );
}
