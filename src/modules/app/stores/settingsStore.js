import { create } from "zustand";

export const settingsStore = create((set) => ({
  defaultSettings: { name: "", phone: "", email: "" },
  setDefaultSettings: (newSettings) => set({ defaultSettings: newSettings }),

  settings: { name: "", phone: "", email: "" },
  setSettings: (newSettings) => set({ settings: newSettings }),
}));
