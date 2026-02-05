"use client";

import React from "react";
import {
    IconPhoto,
    IconZip,
    IconTrash,
    IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageActionsProps {
    onCompress: () => void;
    onDownloadAll: () => void;
    onToggleSelectAll: () => void;
    onRemoveSelected: () => void;
    onClearQueue: () => void;
    isCompressing: boolean;
    isDownloadingAll: boolean;
    hasImages: boolean;
    selectedCount: number;
    allSelected: boolean;
}

export function ImageActions({
    onCompress,
    onDownloadAll,
    onToggleSelectAll,
    onRemoveSelected,
    onClearQueue,
    isCompressing,
    isDownloadingAll,
    hasImages,
    selectedCount,
    allSelected,
}: ImageActionsProps) {
    return (
        <div className="space-y-4 pt-4">
            <Separator className="bg-border/50" />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={onCompress}
                        disabled={selectedCount === 0 || isCompressing}
                    >
                        {isCompressing ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <IconPhoto size={18} />
                                Compress {selectedCount > 0 && `(${selectedCount})`}
                            </span>
                        )}
                    </Button>
                    {hasImages && (
                        <Button
                            variant="outline"
                            onClick={onToggleSelectAll}
                            className="bg-background/50"
                        >
                            {allSelected ? "Unselect All" : "Select All"}
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        disabled={!hasImages || isDownloadingAll}
                        onClick={onDownloadAll}
                        className="bg-secondary/50"
                    >
                        {isDownloadingAll ? "Zipping..." : (
                            <span className="flex items-center gap-2">
                                <IconZip size={18} />
                                Download ZIP
                            </span>
                        )}
                    </Button>
                    {hasImages && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    onClick={onRemoveSelected}
                                    disabled={selectedCount === 0}
                                    className="bg-background/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <span className="flex items-center gap-2">
                                        <IconTrash size={18} />
                                        Remove Selected
                                    </span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remove all selected images from the queue</TooltipContent>
                        </Tooltip>
                    )}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                size="icon"
                                disabled={!hasImages}
                                onClick={onClearQueue}
                                className="opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <IconX size={18} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear the entire queue</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
}
