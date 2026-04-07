"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconSparkles, IconWand } from "@tabler/icons-react";
import { ReferenceMultiUploader } from "./reference-multi-uploader";
import { GenerativeMode, EditReferenceImage, GoogleAIGenerationParams, GoogleAIEditParams } from "@/interfaces/image-generation";

interface GenerationFormProps {
  onGenerate: (params: GoogleAIGenerationParams) => Promise<void>;
  onEdit: (params: GoogleAIEditParams) => Promise<void>;
  isGenerating: boolean;
  disabled: boolean;
}

export function GenerationForm({ onGenerate, onEdit, isGenerating, disabled }: GenerationFormProps) {
  const [mode, setMode] = useState<GenerativeMode>("generate");
  const [model, setModel] = useState("gemini-3-pro-image-preview");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "4:3" | "9:16" | "16:9">("1:1");
  const [sampleCount, setSampleCount] = useState([1]);
  const [editMode, setEditMode] = useState<GoogleAIEditParams["editMode"]>("EDIT_MODE_INPAINT_INSERTION");
  const [referenceImages, setReferenceImages] = useState<EditReferenceImage[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    if (mode === "generate") {
      onGenerate({
        model,
        prompt,
        negativePrompt: negativePrompt || undefined,
        aspectRatio,
        sampleCount: sampleCount[0],
      });
    } else {
      onEdit({
        model: "gemini-3.1-flash-image-preview", // Prefer capability model for editing
        prompt,
        negativePrompt: negativePrompt || undefined,
        editMode,
        sampleCount: sampleCount[0],
        referenceImages
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border p-6 bg-card space-y-6">
      <Tabs value={mode} onValueChange={(v: string) => setMode(v as GenerativeMode)}>
        <TabsList className="grid w-full grid-cols-2 rounded-none mb-6">
          <TabsTrigger value="generate" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <IconSparkles className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="edit" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <IconWand className="w-4 h-4 mr-2" />
            Edit
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="gemini-3-pro-image-preview">Gemini 3 Pro Image (Nano Banana Pro)</SelectItem>
                <SelectItem value="gemini-3.1-flash-image-preview">Gemini 3.1 Flash Image (Nano Banana 2)</SelectItem>
                <SelectItem value="gemini-2.5-flash-image">Gemini 2.5 Flash Image (Nano Banana)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="A futuristic cityscape at sunset..."
              className="resize-none h-24 rounded-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Negative Prompt <span className="text-muted-foreground text-xs font-normal">(Optional)</span></Label>
            <Input
              placeholder="Blurry, low resolution, people"
              className="rounded-none"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            />
          </div>

          {mode === "generate" && (
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(v: "1:1" | "3:4" | "4:3" | "9:16" | "16:9") => setAspectRatio(v)}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Select ratio" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="4:3">4:3 (Landscape)</SelectItem>
                  <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === "edit" && (
            <>
              <div className="space-y-2">
                <Label>Edit Mode</Label>
                <Select value={editMode} onValueChange={(v: typeof editMode) => setEditMode(v)}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder="Select edit mode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="EDIT_MODE_INPAINT_INSERTION">Inpaint (Insertion)</SelectItem>
                    <SelectItem value="EDIT_MODE_INPAINT_REMOVAL">Inpaint (Removal)</SelectItem>
                    <SelectItem value="EDIT_MODE_BGSWAP">Background Swap</SelectItem>
                    <SelectItem value="EDIT_MODE_OUTPAINT">Outpaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reference Images</Label>
                <ReferenceMultiUploader images={referenceImages} onChange={setReferenceImages} />
              </div>
            </>
          )}

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex justify-between">
              <Label>Images to Generate (Total: {sampleCount})</Label>
            </div>
            <Slider
              min={1}
              max={4}
              step={1}
              value={sampleCount}
              onValueChange={setSampleCount}
              className="py-4"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full rounded-none h-12 text-lg font-medium"
            disabled={disabled || isGenerating || !prompt || (mode === 'edit' && referenceImages.length === 0)}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                 <IconSparkles className="animate-spin w-5 h-5" />
                 Generating...
              </span>
            ) : mode === "generate" ? (
              <span className="flex items-center gap-2">
                 <IconSparkles className="w-5 h-5" />
                 Generate Image
              </span>
            ) : (
              <span className="flex items-center gap-2">
                 <IconWand className="w-5 h-5" />
                 Edit Image
              </span>
            )}
          </Button>
        </div>
      </Tabs>
    </form>
  );
}
