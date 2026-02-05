"use client";

import React from "react";
import { IconLayersSubtract } from "@tabler/icons-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageCard } from "./image-card";
import { ImageItem, OutputFormat } from "@/interfaces/image-compression";

interface ImageQueueProps {
    images: ImageItem[];
    selectedIds: string[];
    onToggleSelect: (id: string) => void;
    onRemoveSingle: (id: string) => void;
    onOpenPreview: (url: string, title: string) => void;
    outputFormat: OutputFormat;
}

export function ImageQueue({
    images,
    selectedIds,
    onToggleSelect,
    onRemoveSingle,
    onOpenPreview,
    outputFormat,
}: ImageQueueProps) {
    if (images.length === 0) return null;

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <IconLayersSubtract size={20} className="text-primary" />
                    Upload Queue
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                        ({images.length} images)
                    </span>
                </h2>
            </div>

            <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
                    {images.map((item) => (
                        <ImageCard
                            key={item.id}
                            item={item}
                            isSelected={selectedIds.includes(item.id)}
                            onToggleSelect={onToggleSelect}
                            onRemove={onRemoveSingle}
                            onOpenPreview={onOpenPreview}
                            outputFormat={outputFormat}
                        />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
