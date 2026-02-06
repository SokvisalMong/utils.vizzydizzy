"use client";

import {
  IconVideo,
  IconDownload,
  IconTrash,
  IconEye,
  IconAlertCircle,
  IconCheck,
  IconLoader2
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { VideoItem } from "@/interfaces/video-compression";

interface VideoQueueProps {
  videos: VideoItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onRemoveSingle: (id: string) => void;
  onOpenPreview: (url: string, title: string) => void;
}

export function VideoQueue({
  videos,
  selectedIds,
  onToggleSelect,
  onRemoveSingle,
  onOpenPreview,
}: VideoQueueProps) {
  if (videos.length === 0) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Queue ({videos.length} videos)</h3>
      </div>
      
      <ScrollArea className="h-[400px] border border-muted-foreground/10 bg-card/30 backdrop-blur-sm p-4">
        <div className="space-y-3">
          {videos.map((video) => {
            const isSelected = selectedIds.includes(video.id);
            const isDone = video.status === "done";
            const isProcessing = video.status === "processing" || video.status === "extracting-info";
            const isError = video.status === "error";

            return (
              <div
                key={video.id}
                className={cn(
                  "group relative flex flex-col gap-3 p-4 border transition-all duration-200",
                  isSelected ? "bg-primary/5 border-primary/30" : "bg-background/20 border-transparent hover:border-muted-foreground/20"
                )}
              >
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(video.id)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate text-foreground flex items-center gap-2">
                        <IconVideo size={16} className="text-primary/60" />
                        {video.file.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {isProcessing && <IconLoader2 size={14} className="animate-spin text-primary" />}
                        {isDone && <IconCheck size={14} className="text-green-500" />}
                        {isError && <IconAlertCircle size={14} className="text-destructive" />}
                        <Badge variant="outline" className="text-[10px] font-mono leading-none py-1 h-5 flex items-center">
                          {formatSize(video.originalSize)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-0.5">
                       {video.info && (
                         <span>{video.info.width}x{video.info.height} • {(video.info.duration).toFixed(1)}s</span>
                       )}
                       {isDone && video.compressedSize && (
                         <span className="text-green-500 font-medium">
                           Compressed: {formatSize(video.compressedSize)} 
                           ({Math.round((1 - video.compressedSize / video.originalSize) * 100)}% smaller)
                         </span>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onOpenPreview(video.previewUrl, `Original: ${video.file.name}`)}
                      title="Preview Original"
                    >
                      <IconEye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => video.compressedUrl && onOpenPreview(video.compressedUrl, `Compressed: ${video.file.name}`)}
                      className={cn(isDone ? "text-primary hover:bg-primary/10" : "text-muted-foreground/30")}
                      title="Preview Compressed"
                      disabled={!isDone || !video.compressedUrl}
                    >
                      <IconEye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemoveSingle(video.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      disabled={isProcessing}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </div>

                {isProcessing && (
                  <div className="space-y-1.5 px-8">
                    <Progress value={video.progress} className="h-1" />
                    <p className="text-[10px] text-primary animate-pulse font-medium">
                      {video.status === "extracting-info" ? "Extracting info..." : `Processing... ${Math.round(video.progress)}%`}
                    </p>
                  </div>
                )}

                {isError && (
                  <p className="px-8 text-[10px] text-destructive italic">
                    Error: {video.error || "Unknown error occurred"}
                  </p>
                )}

                {isDone && video.compressedUrl && (
                  <div className="px-8 pt-1">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="h-7 text-[11px] bg-primary/10 hover:bg-primary/20 text-primary border-none"
                    >
                      <a href={video.compressedUrl} download={`compressed_${video.file.name}`}>
                        <IconDownload size={14} className="mr-1.5" />
                        Download Compressed
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
