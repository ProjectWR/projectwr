import { create } from "zustand";

/**
 * Store for managing the main panel's state in the application.
 *
 * @typedef {Object} MainPanelState
 * @property {string} panelType - The current panel type (e.g., "home").
 * @property {*} mode - The current mode of the panel (can be null or specific mode).
 * @property {Array} breadcrumbs - An array of breadcrumb strings representing the navigation path.
 *
 * @typedef {Object} MainPanelStore
 * @property {MainPanelState} mainPanelState - The state object holding the panel properties.
 * @property {function(MainPanelState): void} setMainPanelState - Function to update the main panel state.
 *
 * @example
 * // Update the main panel state to display the settings panel in edit mode with breadcrumbs.
 * mainPanelStore.setMainPanelState({
 *   panelType: "settings",
 *   mode: "edit",
 *   breadcrumbs: ["home", "settings"]
 * });
 */
export const mainPanelStore = create((set) => ({
    mainPanelState: { panelType: "home", mode: null, breadcrumbs: [] },
    setMainPanelState: (mainPanelState) => {
        return set({ mainPanelState: mainPanelState })
    }
}))