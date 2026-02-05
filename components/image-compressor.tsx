"use client";

import React, { useCallback, useRef, useState } from "react";
import JSZip from "jszip";
import {
  IconPhoto,
  IconUpload,
  IconZip,
  IconTrash,
  IconDownload,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconArrowRight,
  IconLayersSubtract,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import {
  ImageItem,
  OutputFormat,
  PreviewState,
  CompressionSettings,
} from "@/interfaces/image-compression";
import {
  compressImageFile,
  formatBytes,
  buildDownloadName,
} from "@/utils/image-processing";
import { cn } from "@/lib/utils";

const OUTPUT_FORMATS: {
  value: OutputFormat;
  label: string;
}[] = [
  { value: "image/webp", label: "WebP" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
];

export function ImageCompressor() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>({
    outputFormat: "image/webp",
    quality: 80,
    targetSizeKB: 0,
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files || []);
    addFiles(files.filter(f => f.type.startsWith("image/")));
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
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
            {/* Upload Area */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Upload Images</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative group cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 min-h-[160px] p-6 text-center",
                  isDragging 
                    ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                    : "border-muted-foreground/20 hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
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

            {/* Config Area */}
            <div className="space-y-6 bg-accent/30 p-6 rounded-xl border border-border/50">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Format & Quality</Label>
                <div className="flex gap-3">
                  <Select
                    value={settings.outputFormat}
                    onValueChange={(v) =>
                      setSettings({ ...settings, outputFormat: v as OutputFormat })
                    }
                  >
                    <SelectTrigger className="w-32 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTPUT_FORMATS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex-1 flex items-center gap-3 bg-background/50 border px-3 h-9">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">Target KB</span>
                    <Input
                      type="number"
                      placeholder="Optional"
                      className="border-none shadow-none focus-visible:ring-0 h-7 bg-transparent px-1 text-right"
                      value={settings.targetSizeKB || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, targetSizeKB: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-muted-foreground">Compression Quality</span>
                  <Badge variant="secondary" className="font-mono">{settings.quality}%</Badge>
                </div>
                <Slider
                  value={[settings.quality]}
                  max={100}
                  min={1}
                  step={1}
                  onValueChange={([val]) => setSettings({ ...settings, quality: val })}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  <span>Smallest Size</span>
                  <span>Highest Quality</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCompress}
                disabled={selectedIds.length === 0 || isCompressing}
                className="shadow-lg shadow-primary/20"
              >
                {isCompressing ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <IconPhoto size={18} />
                    Compress {selectedIds.length > 0 && `(${selectedIds.length})`}
                  </span>
                )}
              </Button>
              {images.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleToggleSelectAll}
                  className="bg-background/50"
                >
                  {allSelected ? "Unselect All" : "Select All"}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={images.length === 0 || isDownloadingAll}
                onClick={handleDownloadAll}
                className="bg-secondary/50"
              >
                {isDownloadingAll ? "Zipping..." : (
                  <span className="flex items-center gap-2">
                    <IconZip size={18} />
                    Download ZIP
                  </span>
                )}
              </Button>
              {images.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleRemoveSelected}
                  disabled={selectedIds.length === 0}
                  className="bg-background/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <span className="flex items-center gap-2">
                    <IconTrash size={18} />
                    Remove Selected
                  </span>
                </Button>
              )}
              <Button 
                variant="destructive" 
                size="icon"
                disabled={images.length === 0}
                onClick={clearImages}
                className="opacity-50 hover:opacity-100 transition-opacity"
                title="Clear All"
              >
                <IconX size={18} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Grid */}
      {images.length > 0 && (
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {images.map((item) => {
              const reduction = item.compressedSize 
                ? Math.round(((item.originalSize - item.compressedSize) / item.originalSize) * 100)
                : 0;
              const isSelected = selectedIds.includes(item.id);

              return (
                <Card 
                  key={item.id}
                  className={cn(
                    "overflow-hidden transition-all duration-300 border-l-4 h-full",
                    isSelected ? "border-l-primary ring-1 ring-primary/20" : "border-l-transparent",
                    item.status === "error" && "border-l-destructive"
                  )}
                >
                  <CardContent className="p-0 h-full">
                    <div className="flex flex-col sm:flex-row h-full min-h-[160px]">
                      {/* Comparisons thumbnails */}
                      <div className="flex gap-px bg-border/50 w-full sm:w-[200px] shrink-0 h-40 sm:h-auto">
                        <div 
                          className="relative flex-1 group cursor-zoom-in overflow-hidden bg-muted flex items-center justify-center"
                          onClick={() => openPreview(item.previewUrl, `Original: ${item.file.name}`)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.previewUrl} className="max-w-full max-h-full object-contain grayscale-[0.2]" alt="Original" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-medium">Original</div>
                        </div>
                        <div 
                          className={cn(
                            "relative flex-1 overflow-hidden flex items-center justify-center",
                            item.compressedUrl ? "group cursor-zoom-in" : "bg-muted"
                          )}
                          onClick={() => item.compressedUrl && openPreview(item.compressedUrl, `Compressed: ${item.file.name}`)}
                        >
                          {item.compressedUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.compressedUrl} className="max-w-full max-h-full object-contain" alt="Compressed" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-medium">Compressed</div>
                            </>
                          ) : (
                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                              {item.status === "processing" ? "..." : "Pending"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Info and Actions */}
                      <div className="flex-1 p-4 flex flex-col min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-auto">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.id)}
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary h-checkbox shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate leading-tight w-full" title={item.file.name}>{item.file.name}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{formatBytes(item.originalSize)}</p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveSingle(item.id)}
                          >
                            <IconX size={14} />
                          </Button>
                        </div>

                        {item.status === "done" && item.compressedSize && (
                          <div className="space-y-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
                                <IconCheck size={12} /> Optimized Result
                              </div>
                              <Badge variant="default" className="text-[10px] h-5 bg-green-500 hover:bg-green-600 border-none">
                                -{reduction}% Saved
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{formatBytes(item.compressedSize)}</span>
                              <IconArrowRight size={12} className="text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground/70">{settings.outputFormat.split("/")[1].toUpperCase()}</span>
                            </div>
                          </div>
                        )}

                        {item.status === "error" && (
                          <div className="p-2 rounded bg-destructive/10 text-destructive text-[10px] flex items-center gap-2">
                            <IconAlertCircle size={14} /> {item.error}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <Progress 
                              value={item.status === "done" ? 100 : 0} 
                              className={cn(
                                "h-1", 
                                item.status === "done" && "bg-green-500/20 [&>div]:bg-green-500"
                              )} 
                            />
                          </div>
                          {item.compressedUrl && (
                            <Button asChild size="sm" variant="outline" className="h-8 px-2.5 bg-background/50">
                              <a href={item.compressedUrl} download={buildDownloadName(item.file.name, item.outputFormat!)}>
                                <IconDownload size={14} className="mr-1.5" />
                                Save
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] p-0 overflow-hidden border-none bg-black/90 backdrop-blur-md">
          <DialogHeader className="p-4 bg-background/50 border-b border-white/10 flex flex-row items-center justify-between shrink-0">
             <DialogTitle className="text-sm font-medium text-white truncate max-w-[80%]">
              {preview?.title}
            </DialogTitle>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-white/10 border-white/20 text-white rounded-full"
              onClick={() => setIsPreviewOpen(false)}
            >
              <IconX size={14} />
            </Button>
          </DialogHeader>
          <div className="p-2 md:p-6 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
            {preview && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={preview.url}
                alt="Preview"
                className="max-h-[70vh] w-auto object-contain shadow-2xl rounded-sm border border-white/5"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
