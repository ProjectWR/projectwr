import { create } from "zustand";

export const oauthStore = create((set) => ({
    userProfile: null,
    authLoadingState: false,
    accessTokenState: null,

    setProfile: (userProfile) => set({ userProfile }),
    setAuthLoadingState: (authLoadingState) => set({ authLoadingState }),
    setAccessTokenState: (accessTokenState) => set({ accessTokenState }),
}));
