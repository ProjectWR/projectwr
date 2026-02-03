import { create } from "zustand";
import { persist } from "zustand/middleware";

export const settingsStore = create(
  persist(
    (set) => ({
      defaultSettings: { theme: "dark", uisize: "medium" },
      setDefaultSettings: (newSettings) =>
        set({ defaultSettings: newSettings }),

      settings: { theme: "dark", uisize: "medium" },
      setSettings: (newSettings) => set({ settings: newSettings }),
    }),
    {
      name: "settings-store",
    },
  ),
);
