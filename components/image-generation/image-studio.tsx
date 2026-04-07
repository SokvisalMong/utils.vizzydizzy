"use client";

import { useState } from "react";
import { ApiKeyInput } from "./api-key-input";
import { GenerationForm } from "./generation-form";
import { ImageResultCard } from "./image-result-card";
import { generateImage, editImage } from "@/utils/image-generation/google-ai-client";
import { GoogleAIGenerationParams, GoogleAIEditParams } from "@/interfaces/image-generation";

export function ImageStudio() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleGenerate = async (params: GoogleAIGenerationParams) => {
    if (!apiKey) return;
    setIsGenerating(true);
    setGlobalError(null);
    
    try {
      const result = await generateImage(apiKey, params);
      if (result.error) {
        setGlobalError(result.error);
      } else if (result.base64Images.length > 0) {
        setImages((prev) => [...result.base64Images, ...prev]);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setGlobalError(e.message || "An unexpected error occurred.");
      } else {
        setGlobalError(String(e));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async (params: GoogleAIEditParams) => {
    if (!apiKey) return;
    setIsGenerating(true);
    setGlobalError(null);
    
    try {
      const result = await editImage(apiKey, params);
      if (result.error) {
        setGlobalError(result.error);
      } else if (result.base64Images.length > 0) {
        setImages((prev) => [...result.base64Images, ...prev]);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setGlobalError(e.message || "An unexpected error occurred.");
      } else {
        setGlobalError(String(e));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <ApiKeyInput onKeySet={setApiKey} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4">
          <div className="sticky top-6">
            <GenerationForm 
              onGenerate={handleGenerate} 
              onEdit={handleEdit}
              isGenerating={isGenerating} 
              disabled={!apiKey} 
            />
          </div>
        </div>

        {/* Main Canvas / Results Gallery */}
        <div className="lg:col-span-8 space-y-6">
          {globalError && (
            <div className="bg-red-500/10 text-red-500 border border-red-500/50 p-4 font-medium">
              API Error: {globalError}
            </div>
          )}

          {images.length === 0 && !isGenerating && !globalError && (
            <div className="h-64 border-2 border-dashed border-border flex items-center justify-center text-muted-foreground bg-card/50">
               No images generated yet. Configure your settings and click Generate.
            </div>
          )}

          <div className="columns-1 md:columns-2 gap-6">
            {isGenerating && (
              <div className="h-64 border border-border flex flex-col items-center justify-center text-muted-foreground bg-card animate-pulse break-inside-avoid mb-6">
                 <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                 <p className="text-sm font-medium">Generating image...</p>
              </div>
            )}

            {images.map((imgBase64, i) => (
              <div key={`${i}-${imgBase64.substring(0, 10)}`} className="break-inside-avoid mb-6">
                <ImageResultCard 
                  base64Data={imgBase64} 
                  onRemove={() => removeImage(i)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
