"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconDownload, IconTrash, IconZoomIn } from "@tabler/icons-react";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";

interface ImageResultCardProps {
  base64Data: string;
  onRemove: () => void;
}

export function ImageResultCard({ base64Data, onRemove }: ImageResultCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const dataUrl = `data:image/png;base64,${base64Data}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64Data}`;
    link.download = `imagen-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="border border-border bg-card overflow-hidden group relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
        alt="Generated Art"
        className="w-full h-auto object-cover"
      />
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center content-center gap-4 backdrop-blur-sm p-4">
          <Button variant="secondary" className="rounded-none shadow-lg" onClick={() => setPreviewOpen(true)}>
            <IconZoomIn className="w-4 h-4 mr-2" />
            Enlarge
          </Button>
          <Button variant="secondary" className="rounded-none shadow-lg" onClick={handleDownload}>
            <IconDownload className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="destructive" className="rounded-none shadow-lg" onClick={onRemove}>
            <IconTrash className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
      </div>

      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        image={dataUrl}
        title="Generated Image"
      />
    </>
  );
}
