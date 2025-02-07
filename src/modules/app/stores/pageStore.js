import { create } from "zustand";

export const pageStore = create((set) => ({
  activeLibraryEntryReference: null,
  setActiveLibraryEntryReference: (libraryEntryReference) => {
    return set({
      activeLibraryEntryReference: libraryEntryReference,
    });
  },

  secondarySidePanel: "libraryManager",
  setSecondarySidePanel: (panel) => {
    return set({ secondarySidePanel: panel });
  },

  activeLibraryItemEntryReference: null,
  setActiveLibraryItemEntryReference: (libraryItemEntryReference) => {
    return set({ activeLibraryItemEntryReference: libraryItemEntryReference });
  },

  contentPanel: "home",
  setContentPanel: (contentPanel) => {
    console.log("setting content panel");
    return set({ contentPanel });
  },
}));
