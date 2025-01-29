import { create } from "zustand";

export const startStore = create((set) => ({
  activeContent: "",
  isActive: false,
  setActiveContent: (content) =>
    set({
      activeContent: content,
    }),
}));
