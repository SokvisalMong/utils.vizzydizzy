import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Theme, Font, SettingsState } from "@/interfaces/settings";

interface SettingsStore extends SettingsState {
  setTheme: (theme: Theme) => void;
  setFont: (font: Font) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      theme: "system",
      font: "font-jetbrains-mono",
      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => localStorage),
      // Backward compatibility: the state will be merged with the persisted data.
      // If a key is missing in persisted data, it will use the default value.
    }
  )
);
