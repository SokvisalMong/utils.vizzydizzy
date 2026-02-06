"use client";

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface VideoPreviewDialogProps {
  video?: string | File | null;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPreviewDialog({
  video,
  title,
  open,
  onOpenChange,
}: VideoPreviewDialogProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [prevVideo, setPrevVideo] = useState<string | File | null | undefined>(
    null,
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  if (video !== prevVideo) {
    setPrevVideo(video);
    if (!(video instanceof File)) {
      setFileUrl(null);
    }
  }

  useEffect(() => {
    if (video instanceof File) {
      const url = URL.createObjectURL(video);
      const timeout = setTimeout(() => setFileUrl(url), 0);
      return () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(url);
      };
    }
  }, [video]);

  const previewUrl = typeof video === "string" ? video : fileUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] sm:max-w-5xl lg:max-w-7xl p-0 overflow-hidden border-none bg-black/90 backdrop-blur-md max-h-[90vh] flex flex-col gap-0!"
      >
        <DialogHeader className="p-4 bg-background/50 border-b border-white/10 flex flex-row items-center justify-between shrink-0 gap-4">
          <DialogTitle className="text-sm font-medium text-white truncate min-w-0 flex-1">
            {title || (video instanceof File ? video.name : "Video Preview")}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <DialogDescription className="sr-only">
              Preview of the selected video.
            </DialogDescription>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                <IconX size={16} />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>
        <div className="p-2 md:p-6 flex items-center justify-center relative min-h-[400px] flex-1">
          {previewUrl ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center gap-4">
              <video
                ref={videoRef}
                src={previewUrl}
                className="max-w-full max-h-[60vh] shadow-2xl"
                controls
              />
            </div>
          ) : (
            <div className="text-white/30 flex items-center justify-center h-full">
              Loading video...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
