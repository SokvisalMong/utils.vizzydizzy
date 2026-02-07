"use client";

import React, { useCallback, useRef, useState } from "react";
import { IconUpload, IconPdf } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PDFDropzoneProps {
    onFileSelected: (file: File) => void;
    className?: string;
}

export function PDFDropzone({
    onFileSelected,
    className,
}: PDFDropzoneProps) {
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
                f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
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
                    ? "border-primary bg-primary/5 scale-[1.01]"
                    : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5",
                "rounded-none", // Strict rule: no rounded corners
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
                accept=".pdf,application/pdf"
                className="hidden"
            />

            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="mb-4 bg-orange-500/10 p-4 text-orange-500">
                    <IconPdf size={32} />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground">
                    Upload PDF
                </h3>
                <p className="mb-6 text-sm text-muted-foreground max-w-[280px]">
                    Drag and drop your PDF file here, or click to browse.
                    Each page will be exported as a PNG image.
                </p>

                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="secondary"
                    className="bg-primary/10 hover:bg-primary/20 text-primary border-none rounded-none"
                >
                    <IconUpload size={18} className="mr-2" />
                    Select PDF File
                </Button>
            </div>
        </div>
    );
}
