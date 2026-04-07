"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconKey, IconCheck, IconTrash } from "@tabler/icons-react";

interface ApiKeyInputProps {
  onKeySet: (key: string | null) => void;
}

export function ApiKeyInput({ onKeySet }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("google_ai_api_key");
    if (savedKey) {
      setTimeout(() => {
        setApiKey(savedKey);
        setIsSaved(true);
        onKeySet(savedKey);
      }, 0);
    }
  }, [onKeySet]);

  const handleSave = () => {
    if (!apiKey) return;
    localStorage.setItem("google_ai_api_key", apiKey.trim());
    setIsSaved(true);
    onKeySet(apiKey.trim());
  };

  const handleClear = () => {
    localStorage.removeItem("google_ai_api_key");
    setApiKey("");
    setIsSaved(false);
    onKeySet(null);
  };

  return (
    <div className="bg-card border border-border p-6 shadow-sm w-full">
      <div className="flex flex-col space-y-4">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <IconKey className="w-5 h-5 text-muted-foreground" />
            Bring Your Own API Key
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your API key will NOT be uploaded and will only be saved in your browser&apos;s localStorage. 
            Generate one via <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google AI Studio</a>.
          </p>
        </div>
        
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="api-key">Gemini API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIzaSy..."
              className="rounded-none font-mono"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isSaved}
            />
          </div>
          {isSaved ? (
            <Button variant="outline" className="rounded-none bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 border-none" onClick={handleClear}>
              <IconTrash className="w-4 h-4 mr-2" />
              Clear
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={!apiKey} className="rounded-none">
              <IconCheck className="w-4 h-4 mr-2" />
              Save Key
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
