"use client";

import { useCallback, useState } from "react";
import { IconVideo } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  VideoItem,
  VideoCompressionSettings,
} from "@/interfaces/video-compression";
import {
  compressVideo,
  getVideoInfo,
} from "@/utils/video-processing";

import { VideoPreviewDialog } from "./video-preview-dialog";
import { VideoDropzone } from "./video-compression/video-dropzone";
import { VideoSettings } from "./video-compression/video-settings";
import { VideoActions } from "./video-compression/video-actions";
import { VideoQueue } from "./video-compression/video-queue";

export function VideoCompressor() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [settings, setSettings] = useState<VideoCompressionSettings>({
    targetResolution: "original",
    targetSizeValue: 8,
    targetSizeUnit: "MB",
    crf: 23,
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog preview state
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const openPreview = (url: string, title: string) => {
    setPreview({ url, title });
    setIsPreviewOpen(true);
  };

  const addFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;

    const newItems: VideoItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file), // This is for the original file
      originalSize: file.size,
      status: "pending",
      progress: 0,
    }));

    setVideos((prev) => [...prev, ...newItems]);
    setSelectedIds((prev) => [...prev, ...newItems.map((item) => item.id)]);

    // Proactively get video info for new items
    for (const item of newItems) {
      setVideos(prev => prev.map(v => v.id === item.id ? { ...v, status: "extracting-info" } : v));
      try {
        const info = await getVideoInfo(item.file);
        setVideos(prev => prev.map(v => v.id === item.id ? { ...v, info, status: "pending" } : v));
      } catch (error) {
        console.error("Failed to get video info:", error);
        setVideos(prev => prev.map(v => v.id === item.id ? { ...v, status: "pending" } : v));
      }
    }
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (!videos.length) return;
    const allSelected = selectedIds.length === videos.length;
    setSelectedIds(allSelected ? [] : videos.map((item) => item.id));
  };

  const removeVideosByIds = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      const idsSet = new Set(ids);

      setVideos((prev) => {
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

  const handleRemoveSingle = (id: string) => removeVideosByIds([id]);
  const handleRemoveSelected = () => removeVideosByIds(selectedIds);
  const clearQueue = () => removeVideosByIds(videos.map((i) => i.id));

  const handleCompress = async () => {
    const targetIds = new Set(selectedIds);
    if (targetIds.size === 0) return;

    setIsCompressing(true);

    try {
      // Process videos one by one (ffmpeg.wasm usually handles single instances better)
      for (const item of videos) {
        if (!targetIds.has(item.id)) continue;
        if (item.status === "processing") continue;

        setVideos(prev => prev.map(v => v.id === item.id ? { ...v, status: "processing", progress: 0 } : v));
        
        try {
          if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);

          const blob = await compressVideo(
            item.file,
            settings,
            (progress) => {
              setVideos(prev => prev.map(v => v.id === item.id ? { ...v, progress } : v));
            },
            item.info
          );

          setVideos(prev => prev.map(v => 
            v.id === item.id ? {
              ...v,
              compressedUrl: URL.createObjectURL(blob),
              compressedSize: blob.size,
              compressedBlob: blob,
              status: "done" as const,
              progress: 100,
            } : v
          ));
        } catch (error) {
          console.error("Compression error:", error);
          setVideos(prev => prev.map(v => 
            v.id === item.id ? {
              ...v,
              status: "error" as const,
              error: error instanceof Error ? error.message : "Compression failed",
            } : v
          ));
        }
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const allSelected = videos.length > 0 && selectedIds.length === videos.length;

  return (
    <TooltipProvider>
      <div className="space-y-8 animate-in fade-in duration-500">
        <Card className="border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <IconVideo size={24} />
              <CardTitle>Video Compression Settings</CardTitle>
            </div>
            <CardDescription>
              Adjust resolution and target file size. Processing happens entirely in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <VideoDropzone onFilesSelected={addFiles} />
              <VideoSettings settings={settings} onChange={setSettings} />
            </div>

            <VideoActions
              onCompress={handleCompress}
              onToggleSelectAll={handleToggleSelectAll}
              onRemoveSelected={handleRemoveSelected}
              onClearQueue={clearQueue}
              isCompressing={isCompressing}
              hasVideos={videos.length > 0}
              selectedCount={selectedIds.length}
              allSelected={allSelected}
            />
          </CardContent>
        </Card>

        <VideoQueue
          videos={videos}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onRemoveSingle={handleRemoveSingle}
          onOpenPreview={openPreview}
        />

        <VideoPreviewDialog
          video={preview?.url}
          title={preview?.title}
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
        />
      </div>
    </TooltipProvider>
  );
}
