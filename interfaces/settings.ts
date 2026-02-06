export type Theme = "light" | "dark" | "system";

export type Font = "font-inter" | "font-geist" | "font-jetbrains-mono";

export interface SettingsState {
  theme: Theme;
  font: Font;
}
