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

  sideBarOpened: true,
  setSideBarOpened: (sideBarOpened) => {
    return set({ sideBarOpened: sideBarOpened });
  },

  zoom: 1,
  setZoom: (zoom) => {
    return set({ zoom: zoom });
  }
}));
