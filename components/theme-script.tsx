"use client";

import * as React from "react";

export function ThemeScript() {
  const scriptContent = `
    (function() {
      try {
        const storage = localStorage.getItem('app-settings');
        if (storage) {
          const settings = JSON.parse(storage);
          const font = settings.state.font;
          if (font) {
            document.documentElement.classList.add(font);
          }
        } else {
          document.documentElement.classList.add('font-jetbrains-mono');
        }
      } catch (e) {
        console.error('ThemeScript Error:', e);
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}
