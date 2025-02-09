import { create } from "zustand";

export const settingsStore = create((set) => ({
  defaultSettings: { theme: 'dark', uisize: 'medium' },
  setDefaultSettings: (newSettings) => set({ defaultSettings: newSettings }),

  settings: { theme: 'dark', uisize: 'medium' },
  setSettings: (newSettings) => set({ settings: newSettings }),
}));
