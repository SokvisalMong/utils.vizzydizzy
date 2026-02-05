"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CompressionSettings, OutputFormat } from "@/interfaces/image-compression";

const OUTPUT_FORMATS: {
    value: OutputFormat;
    label: string;
}[] = [
        { value: "image/webp", label: "WebP" },
        { value: "image/jpeg", label: "JPEG" },
        { value: "image/png", label: "PNG" },
    ];

interface ImageSettingsProps {
    settings: CompressionSettings;
    onChange: (settings: CompressionSettings) => void;
}

export function ImageSettings({ settings, onChange }: ImageSettingsProps) {
    return (
        <div className="space-y-6 bg-accent/30 p-6 border border-border/50">
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Format & Quality</Label>
                <div className="flex gap-3">
                    <Select
                        value={settings.outputFormat}
                        onValueChange={(v) =>
                            onChange({ ...settings, outputFormat: v as OutputFormat })
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
                            className="border-none focus-visible:ring-0 h-7 bg-transparent px-1 text-right"
                            value={settings.targetSizeKB || ""}
                            onChange={(e) =>
                                onChange({ ...settings, targetSizeKB: Number(e.target.value) })
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
                    onValueChange={([val]) => onChange({ ...settings, quality: val })}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    <span>Smallest Size</span>
                    <span>Highest Quality</span>
                </div>
            </div>
        </div>
    );
}
