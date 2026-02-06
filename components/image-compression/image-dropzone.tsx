"use client";

import React, { useCallback, useRef, useState } from "react";
import { IconUpload, IconPhoto } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export function ImageDropzone({
  onFilesSelected,
  className,
}: ImageDropzoneProps) {
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

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        onFilesSelected(files);
      }
      // Reset value so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onFilesSelected],
  );

  return (
    <div
      className={cn(
        "relative border-2 border-dashed transition-all duration-200",
        "bg-background/40 backdrop-blur-sm",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5",
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
        accept="image/*"
        multiple
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="mb-4 bg-primary/10 p-4 text-primary">
          <IconPhoto size={32} />
        </div>

        <h3 className="mb-2 text-lg font-semibold text-foreground">
          Upload Images
        </h3>
        <p className="mb-6 text-sm text-muted-foreground max-w-[240px]">
          Drag and drop your images here, or click to browse.
        </p>

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          className="bg-primary/10 hover:bg-primary/20 text-primary border-none rounded-none"
        >
          <IconUpload size={18} className="mr-2" />
          Select Files
        </Button>
      </div>
    </div>
  );
}
