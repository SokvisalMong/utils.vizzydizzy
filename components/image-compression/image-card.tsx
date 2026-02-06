"use client";

import Image from "next/image";
import {
  IconCheck,
  IconArrowRight,
  IconAlertCircle,
  IconX,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ImageItem, OutputFormat } from "@/interfaces/image-compression";
import { formatBytes, buildDownloadName } from "@/utils/image-processing";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  item: ImageItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onOpenPreview: (url: string, title: string) => void;
  outputFormat: OutputFormat;
}

export function ImageCard({
  item,
  isSelected,
  onToggleSelect,
  onRemove,
  onOpenPreview,
  outputFormat,
}: ImageCardProps) {
  const reduction = item.compressedSize
    ? Math.round(
        ((item.originalSize - item.compressedSize) / item.originalSize) * 100,
      )
    : 0;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 border-l-4 h-full",
        isSelected
          ? "border-l-primary ring-1 ring-primary/20"
          : "border-l-transparent",
        item.status === "error" && "border-l-destructive",
      )}
    >
      <CardContent className="p-0 h-full">
        <div className="flex flex-col sm:flex-row h-full min-h-[160px]">
          {/* Comparisons thumbnails */}
          <div className="flex gap-px bg-border/50 w-full sm:w-[200px] shrink-0 h-40 sm:h-auto">
            <div
              className="relative flex-1 group cursor-zoom-in overflow-hidden bg-muted flex items-center justify-center"
              onClick={() =>
                onOpenPreview(item.previewUrl, `Original: ${item.file.name}`)
              }
            >
              <Image
                src={item.previewUrl}
                alt="Original"
                fill
                unoptimized
                className="object-contain grayscale-[0.2]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-medium">
                Original
              </div>
            </div>
            <div
              className={cn(
                "relative flex-1 overflow-hidden flex items-center justify-center",
                item.compressedUrl ? "group cursor-zoom-in" : "bg-muted",
              )}
              onClick={() =>
                item.compressedUrl &&
                onOpenPreview(
                  item.compressedUrl,
                  `Compressed: ${item.file.name}`,
                )
              }
            >
              {item.compressedUrl ? (
                <>
                  <Image
                    src={item.compressedUrl}
                    alt="Compressed"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-medium">
                    Compressed
                  </div>
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
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(item.id)}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-semibold truncate leading-tight w-full"
                    title={item.file.name}
                  >
                    {item.file.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatBytes(item.originalSize)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <IconX size={14} />
              </Button>
            </div>

            {item.status === "done" && item.compressedSize && (
              <div className="space-y-3 bg-primary/5 p-3 border border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
                    <IconCheck size={12} /> Optimized Result
                  </div>
                  <Badge
                    variant="default"
                    className="text-[10px] h-5 bg-green-500 hover:bg-green-600 border-none"
                  >
                    -{reduction}% Saved
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">
                    {formatBytes(item.compressedSize)}
                  </span>
                  <IconArrowRight size={12} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground/70">
                    {outputFormat.split("/")[1].toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {item.status === "error" && (
              <div className="p-2 bg-destructive/10 text-destructive text-[10px] flex items-center gap-2">
                <IconAlertCircle size={14} /> {item.error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 mt-4">
              <div className="flex-1">
                <Progress
                  value={item.status === "done" ? 100 : 0}
                  className={cn(
                    "h-1",
                    item.status === "done" &&
                      "bg-green-500/20 [&>div]:bg-green-500",
                  )}
                />
              </div>
              {item.compressedUrl && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 bg-background/50"
                >
                  <a
                    href={item.compressedUrl}
                    download={buildDownloadName(item.file.name, outputFormat)}
                  >
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
}
