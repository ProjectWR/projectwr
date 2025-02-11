import { create } from "zustand";

export const templateStore = create((set) => ({
  templateId: 'unselected',
  setTemplateId: (templateId) => {
    return set({ templateId: templateId });
  },

  templateMode: 'details',
  setTemplateMode: (templateMode) => {
    return set({ templateMode: templateMode });
  },
}));
