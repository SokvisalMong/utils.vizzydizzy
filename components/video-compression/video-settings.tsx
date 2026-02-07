"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { IconSettings, IconResize, IconWeight } from "@tabler/icons-react";
import { VideoCompressionSettings, ResolutionHeight, TargetSizeUnit } from "@/interfaces/video-compression";
import { cn } from "@/lib/utils";

interface VideoSettingsProps {
  settings: VideoCompressionSettings;
  onChange: (settings: VideoCompressionSettings) => void;
}

const resolutions: { label: string; value: ResolutionHeight }[] = [
  { label: "Original", value: "original" },
  { label: "1080p (Full HD)", value: 1080 },
  { label: "720p (HD)", value: 720 },
  { label: "480p (SD)", value: 480 },
  { label: "360p", value: 360 },
];

export function VideoSettings({ settings, onChange }: VideoSettingsProps) {
  const getQualityLabel = (crf: number) => {
    if (crf <= 17) return { label: "Visually Lossless", color: "text-green-400" };
    if (crf <= 22) return { label: "High Quality", color: "text-primary" };
    if (crf <= 27) return { label: "Standard Quality", color: "text-primary/80" };
    if (crf <= 35) return { label: "Medium (Small File)", color: "text-orange-400" };
    return { label: "Low (Smallest File)", color: "text-destructive" };
  };

  const quality = getQualityLabel(settings.crf);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <IconResize size={20} />
          <Label className="text-sm font-medium">Output Resolution</Label>
        </div>
        <Select
          value={settings.targetResolution.toString()}
          onValueChange={(val) =>
            onChange({
              ...settings,
              targetResolution: (val === "original" ? "original" : parseInt(val)) as ResolutionHeight
            })
          }
        >
          <SelectTrigger className="w-full bg-background/50 border-muted-foreground/20">
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            {resolutions.map((res) => (
              <SelectItem key={res.value} value={res.value.toString()}>
                {res.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <IconWeight size={20} />
          <Label className="text-sm font-medium">Target File Size</Label>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              value={settings.targetSizeValue}
              onChange={(e) => onChange({ ...settings, targetSizeValue: parseFloat(e.target.value) || 0 })}
              className="bg-background/50 border-muted-foreground/20"
              placeholder={settings.targetSizeUnit === "MB" ? "Enter MB" : "Enter %"}
            />
          </div>
          <Select
            value={settings.targetSizeUnit}
            onValueChange={(val: TargetSizeUnit) => onChange({ ...settings, targetSizeUnit: val })}
          >
            <SelectTrigger className="w-[100px] bg-background/50 border-muted-foreground/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MB">MB</SelectItem>
              <SelectItem value="percentage">%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Set to 0 to use quality-based compression (CRF).
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <IconSettings size={20} />
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm font-medium">Quality (CRF)</Label>
              <span className={cn("text-[10px] font-bold uppercase tracking-tight transition-colors", quality.color)}>
                {quality.label}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {settings.crf}
          </span>
        </div>
        <Slider
          value={[settings.crf]}
          min={0}
          max={51}
          step={1}
          onValueChange={([val]) => onChange({ ...settings, crf: val })}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
          <span>Better Quality</span>
          <span>Smaller Size</span>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          CRF applies only if target file size is 0. 23 is standard.
        </p>
      </div>
    </div>
  );
}
