import { create } from "zustand";

export const appStore = create((set) => ({
  loading: true,
  setLoading: (loading) => {
    return set({ loading: loading });
  },

  activity: "home",
  setActivity: (activity) => {
    return set({ activity: activity });
  },

  panelOpened: false,
  setPanelOpened: (panelOpened) => {
    return set({ panelOpened: panelOpened });
  },

  showActivityBar: true,
  setShowActivityBar: (showActivityBar) => {
    return set({ showActivityBar: showActivityBar });
  },

  libraryListStore: null,
  setLibraryListStore: (libraryListStore) => {
    return set({ libraryListStore: libraryListStore });
  }
}));
