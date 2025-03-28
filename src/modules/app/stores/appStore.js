import { getAuth } from "firebase/auth";
import { create } from "zustand";
import firebaseApp from "../lib/Firebase";

export const appStore = create((set) => ({
  loading: true,
  setLoading: (loading) => {
    return set({ loading: loading });
  },

  user: getAuth(firebaseApp).currentUser,
  setUser: (user) => {
    return set({ user: user });
  },

  panelOpened: false,
  setPanelOpened: (panelOpened) => {
    return set({ panelOpened: panelOpened });
  },

  showActivityBar: true,
  setShowActivityBar: (showActivityBar) => {
    return set({ showActivityBar: showActivityBar });
  },

  sideBarOpened: true,
  setSideBarOpened: (sideBarOpened) => {
    return set({ sideBarOpened: sideBarOpened });
  },

  zoom: 1,
  setZoom: (zoom) => {
    return set({ zoom: zoom });
  },

  activity: "home",
  setActivity: (activity) => {
    return set({ activity: activity });
  },

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

  templateId: 'unselected',
  setTemplateId: (templateId) => {
    return set({ templateId: templateId });
  },

  templateMode: 'details',
  setTemplateMode: (templateMode) => {
    return set({ templateMode: templateMode });
  },

  dictionaryWord: '',
  setDictionaryWord: (dictionaryWord) => {
    return set({ dictionaryWord: dictionaryWord });
  },

  dictionaryMode: '',
  setDictionaryMode: (dictionaryMode) => {
    return set({ dictionaryMode: dictionaryMode });
  }
}));
