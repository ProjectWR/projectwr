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

  // doc: null,
  // setDoc: (doc) => {
  //   return set({ doc: doc });
  // },
}));
