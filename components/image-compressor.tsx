"use client";

import React, { useCallback, useState } from "react";
import JSZip from "jszip";
import { IconPhoto } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  ImageItem,
  OutputFormat,
  PreviewState,
  CompressionSettings,
} from "@/interfaces/image-compression";
import {
  compressImageFile,
  buildDownloadName,
} from "@/utils/image-processing";

import { ImagePreviewDialog } from "./image-preview-dialog";
import { ImageDropzone } from "./image-compression/image-dropzone";
import { ImageSettings } from "./image-compression/image-settings";
import { ImageActions } from "./image-compression/image-actions";
import { ImageQueue } from "./image-compression/image-queue";

export function ImageCompressor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>({
    outputFormat: "image/webp",
    quality: 80,
    targetSizeKB: 0,
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog preview state
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = (url: string, title: string) => {
    setPreview({ url, title });
    setIsPreviewOpen(true);
  };

  const addFiles = useCallback((files: File[]) => {
    if (!files.length) return;

    const newItems: ImageItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      status: "pending",
    }));

    setImages((prev) => [...prev, ...newItems]);
    setSelectedIds((prev) => [...prev, ...newItems.map((item) => item.id)]);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (!images.length) return;
    const allSelected = selectedIds.length === images.length;
    setSelectedIds(allSelected ? [] : images.map((item) => item.id));
  };

  const removeImagesByIds = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      const idsSet = new Set(ids);

      setImages((prev) => {
        prev.forEach((item) => {
          if (idsSet.has(item.id)) {
            URL.revokeObjectURL(item.previewUrl);
            if (item.compressedUrl) {
              URL.revokeObjectURL(item.compressedUrl);
            }
          }
        });
        return prev.filter((item) => !idsSet.has(item.id));
      });

      setSelectedIds((prev) => prev.filter((id) => !idsSet.has(id)));
    },
    []
  );

  const handleRemoveSingle = (id: string) => removeImagesByIds([id]);
  const handleRemoveSelected = () => removeImagesByIds(selectedIds);
  const clearImages = () => removeImagesByIds(images.map((i) => i.id));

  const handleCompress = async () => {
    const targetIds = new Set(selectedIds);
    if (targetIds.size === 0) return;

    setIsCompressing(true);

    try {
      const updatedImages = await Promise.all(
        images.map(async (item) => {
          if (!targetIds.has(item.id)) return item;

          try {
            if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);

            const blob = await compressImageFile(
              item.file,
              settings.outputFormat,
              settings.quality / 100,
              settings.targetSizeKB || undefined
            );

            return {
              ...item,
              compressedUrl: URL.createObjectURL(blob),
              compressedSize: blob.size,
              compressedBlob: blob,
              outputFormat: settings.outputFormat,
              status: "done" as const,
            };
          } catch (error) {
            return {
              ...item,
              status: "error" as const,
              error: error instanceof Error ? error.message : "Compression failed",
            };
          }
        })
      );
      setImages(updatedImages);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownloadAll = async () => {
    const results = images.filter((i) => i.status === "done" && i.compressedBlob);
    if (!results.length) return;

    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      results.forEach((item) => {
        const name = buildDownloadName(item.file.name, item.outputFormat!);
        zip.file(name, item.compressedBlob!);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed_images.zip";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const allSelected = images.length > 0 && selectedIds.length === images.length;

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <IconPhoto size={24} />
              <CardTitle>Image Settings</CardTitle>
            </div>
            <CardDescription>
              Configure your compression parameters and upload images.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageDropzone onFilesSelected={addFiles} />
              <ImageSettings settings={settings} onChange={setSettings} />
            </div>

            <ImageActions
              onCompress={handleCompress}
              onDownloadAll={handleDownloadAll}
              onToggleSelectAll={handleToggleSelectAll}
              onRemoveSelected={handleRemoveSelected}
              onClearQueue={clearImages}
              isCompressing={isCompressing}
              isDownloadingAll={isDownloadingAll}
              hasImages={images.length > 0}
              selectedCount={selectedIds.length}
              allSelected={allSelected}
            />
          </CardContent>
        </Card>

        <ImageQueue
          images={images}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onRemoveSingle={handleRemoveSingle}
          onOpenPreview={openPreview}
          outputFormat={settings.outputFormat}
        />

        <ImagePreviewDialog
          image={preview?.url}
          title={preview?.title}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      </div>
    </TooltipProvider>
  );
}
