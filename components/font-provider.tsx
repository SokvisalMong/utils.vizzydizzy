"use client";

import * as React from "react";
import { useSettingsStore } from "@/lib/store/settings-store";

export function FontProvider({ children }: { children: React.ReactNode }) {
  const font = useSettingsStore((state) => state.font);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    // Only apply font after mount to sync state with the DOM.
    // The ThemeScript handles the INITIAL application to prevent FOUC.
    if (!mounted) return;

    const fontClasses = ["font-inter", "font-geist", "font-jetbrains-mono"];
    document.documentElement.classList.remove(...fontClasses);
    document.documentElement.classList.add(font);
  }, [font, mounted]);

  return <>{children}</>;
}
