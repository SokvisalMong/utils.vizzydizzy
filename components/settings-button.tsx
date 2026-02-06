"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { IconSettings, IconSun, IconMoon, IconDeviceDesktop, IconTypography } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/lib/store/settings-store";
import { Font, Theme } from "@/interfaces/settings";

export function SettingsButton() {
  const { theme, setTheme } = useTheme();
  const setStoreTheme = useSettingsStore((state) => state.setTheme);
  const font = useSettingsStore((state) => state.font);
  const setFont = useSettingsStore((state) => state.setFont);

  // Sync next-themes with our store
  const handleThemeChange = (value: string) => {
    const newTheme = value as Theme;
    setTheme(newTheme);
    setStoreTheme(newTheme);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-none border-2 shadow-lg bg-background hover:bg-accent"
          >
            <IconSettings className="h-6 w-6" />
            <span className="sr-only">Toggle settings</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 rounded-none p-4 shadow-xl border-2">
          <div className="grid gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-lg leading-none">Settings</h4>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger id="theme" className="rounded-none w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="light" className="rounded-none">
                      <div className="flex items-center gap-2">
                        <IconSun className="h-4 w-4" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark" className="rounded-none">
                      <div className="flex items-center gap-2">
                        <IconMoon className="h-4 w-4" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system" className="rounded-none">
                      <div className="flex items-center gap-2">
                        <IconDeviceDesktop className="h-4 w-4" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="font">Font Family</Label>
                <Select
                  value={font}
                  onValueChange={(value) => setFont(value as Font)}
                >
                  <SelectTrigger id="font" className="rounded-none w-full">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="font-inter" className="rounded-none">
                      <div className="flex items-center gap-2">
                        <IconTypography className="h-4 w-4" />
                        <span className="font-inter">Inter</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="font-geist" className="rounded-none">
                      <div className="flex items-center gap-2">
                        <IconTypography className="h-4 w-4" />
                        <span className="font-geist">Geist Sans</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="font-jetbrains-mono" className="rounded-none">
                      <div className="flex items-center gap-2">
                        <IconTypography className="h-4 w-4" />
                        <span className="font-jetbrains-mono">JetBrains Mono</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
