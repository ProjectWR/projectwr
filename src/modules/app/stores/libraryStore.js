import { create } from "zustand";

export const libraryStore = create((set) => ({
  libraryId: 'unselected',
  setLibraryId: (libraryId) => {
    return set({ libraryId: libraryId });
  },

  itemId: 'unselected',
  setItemId: (itemId) => {
    return set({ itemId: itemId });
  },

  itemMode: 'details',
  setItemMode: (itemMode) => {
    return set({ itemMode: itemMode });
  },

  // doc: null,
  // setDoc: (doc) => {
  //   return set({ doc: doc });
  // },
}));
