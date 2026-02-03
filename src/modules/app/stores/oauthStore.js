import { create } from "zustand";
import { persist } from "zustand/middleware";

export const oauthStore = create(
  persist(
    (set) => ({
      userProfile: null,
      authLoadingState: false,
      accessTokenState: null,

      setProfile: (userProfile) => set({ userProfile }),
      setAuthLoadingState: (authLoadingState) => set({ authLoadingState }),
      setAccessTokenState: (accessTokenState) => set({ accessTokenState }),
    }),
    {
      name: "oauth-store",
      partialize: (state) => ({
        userProfile: state.userProfile,
        accessTokenState: state.accessTokenState,
      }),
    },
  ),
);
