"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { IconUpload, IconX } from "@tabler/icons-react";
import { EditReferenceImage } from "@/interfaces/image-generation";

interface ReferenceUploaderProps {
  images: EditReferenceImage[];
  onChange: (images: EditReferenceImage[]) => void;
  maxFiles?: number;
}

export function ReferenceMultiUploader({ images, onChange, maxFiles = 2 }: ReferenceUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data URL prefix for base64
        const base64Data = result.split(",")[1];
        
        let targetType: "REFERENCE_TYPE_RAW" | "REFERENCE_TYPE_MASK" = "REFERENCE_TYPE_RAW";
        
        // Very basic heuristic: if first image is raw, second is mask
        // You could also allow users to explicitly set this.
        if (images.length === 1 && images[0].referenceType === "REFERENCE_TYPE_RAW") {
          targetType = "REFERENCE_TYPE_MASK";
        }

        const newImage: EditReferenceImage = {
          referenceId: Date.now(),
          referenceType: targetType,
          base64Data,
        };

        onChange([...images, newImage].slice(0, maxFiles));
      };
      reader.readAsDataURL(file);
    });
  }, [images, onChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    disabled: images.length >= maxFiles
  });

  const removeImage = (id: number) => {
    onChange(images.filter((img) => img.referenceId !== id));
  };

  const toggleType = (id: number) => {
    onChange(images.map((img) => {
      if (img.referenceId === id) {
        return {
          ...img,
          referenceType: img.referenceType === "REFERENCE_TYPE_RAW" ? "REFERENCE_TYPE_MASK" : "REFERENCE_TYPE_RAW"
        };
      }
      return img;
    }));
  };

  return (
    <div className="space-y-4">
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <IconUpload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drop reference images here, or click to select files
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports PNG, JPG, WEBP ({images.length}/{maxFiles} uploaded)
          </p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((img) => (
            <div key={img.referenceId} className="relative group border border-border p-2">
              <div className="aspect-square relative flex items-center justify-center bg-muted/50 overflow-hidden">
                {/* Reconstruct data URI to show preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`data:image/png;base64,${img.base64Data}`} 
                  alt="Reference" 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleType(img.referenceId)}
                  className="text-xs font-mono px-2 py-1 bg-muted hover:bg-muted/80"
                >
                  {img.referenceType.replace("REFERENCE_TYPE_", "")}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(img.referenceId)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
