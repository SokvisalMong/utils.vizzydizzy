"use client";

import { Button } from "@/components/ui/button";
import { 
  IconPlayerPlay, 
  IconTrash, 
  IconSquareCheck,
  IconSquare,
  IconX
} from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface VideoActionsProps {
  onCompress: () => void;
  onClearQueue: () => void;
  onToggleSelectAll: () => void;
  onRemoveSelected: () => void;
  isCompressing: boolean;
  hasVideos: boolean;
  selectedCount: number;
  allSelected: boolean;
}

export function VideoActions({
  onCompress,
  onClearQueue,
  onToggleSelectAll,
  onRemoveSelected,
  isCompressing,
  hasVideos,
  selectedCount,
  allSelected,
}: VideoActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-muted-foreground/10">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSelectAll}
          disabled={!hasVideos || isCompressing}
          className="text-muted-foreground hover:text-primary h-9"
        >
          {allSelected ? <IconSquareCheck size={18} className="mr-2" /> : <IconSquare size={18} className="mr-2" />}
          {allSelected ? "Deselect All" : "Select All"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveSelected}
          disabled={selectedCount === 0 || isCompressing}
          className="text-muted-foreground hover:text-destructive h-9"
        >
          <IconTrash size={18} className="mr-2" />
          Remove Selected {selectedCount > 0 && `(${selectedCount})`}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onClearQueue}
              disabled={!hasVideos || isCompressing}
              className="border-muted-foreground/20 h-9 w-9 text-muted-foreground hover:text-destructive hover:border-destructive/30"
            >
              <IconX size={18} />
              <span className="sr-only">Clear Queue</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear entire queue</TooltipContent>
        </Tooltip>

        <Button
          onClick={onCompress}
          disabled={!hasVideos || isCompressing || selectedCount === 0}
          className={cn(
            "bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px] h-9 rounded-none",
            isCompressing && "animate-pulse"
          )}
        >
          {isCompressing ? (
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin border-2 border-current border-t-transparent" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <IconPlayerPlay size={18} />
              Compress {selectedCount > 0 ? "Selected" : "Videos"}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
