import { useState, useEffect, useCallback } from "react";
import { DEFAULT_FORMAT_SETTINGS } from "../formatConstants";
import { getEffectiveSettings } from "../utils/formatUtils";

/**
 * Custom hook for managing format settings with persistence
 */
export const useFormatSettings = (store, libraryId) => {
  const [globalSettings, setGlobalSettings] = useState({});
  const [pageTypeSettings, setPageTypeSettings] = useState({});
  const [pageSettings, setPageSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from store on mount
  useEffect(() => {
    const loadSettings = async () => {
      if (!store) return;

      try {
        const savedGlobal = await store.get("formatSettings_global");
        const savedPageTypes = await store.get("formatSettings_pageTypes");
        const savedPages = await store.get("formatSettings_pages");

        setGlobalSettings(savedGlobal || {});
        setPageTypeSettings(savedPageTypes || {});
        setPageSettings(savedPages || {});
      } catch (error) {
        console.error("Error loading format settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [store, libraryId]);

  // Update global settings
  const updateGlobalSettings = useCallback(
    async (updates) => {
      const newSettings = { ...globalSettings, ...updates };
      setGlobalSettings(newSettings);

      if (store) {
        await store.set("formatSettings_global", newSettings);
        await store.save();
      }
    },
    [globalSettings, store],
  );

  // Update page type settings
  const updatePageTypeSettings = useCallback(
    async (pageType, updates) => {
      const newSettings = {
        ...pageTypeSettings,
        [pageType]: { ...pageTypeSettings[pageType], ...updates },
      };
      setPageTypeSettings(newSettings);

      if (store) {
        await store.set("formatSettings_pageTypes", newSettings);
        await store.save();
      }
    },
    [pageTypeSettings, store],
  );

  // Update page settings
  const updatePageSettings = useCallback(
    async (pageId, updates) => {
      const newSettings = {
        ...pageSettings,
        [pageId]: { ...pageSettings[pageId], ...updates },
      };
      setPageSettings(newSettings);

      if (store) {
        await store.set("formatSettings_pages", newSettings);
        await store.save();
      }
    },
    [pageSettings, store],
  );

  // Get effective settings for a specific page
  const getEffectiveSettingsForPage = useCallback(
    (page) => {
      return getEffectiveSettings(
        page,
        globalSettings,
        pageTypeSettings,
        pageSettings,
      );
    },
    [globalSettings, pageTypeSettings, pageSettings],
  );

  // Reset a specific setting at a level
  const resetSetting = useCallback(
    async (level, settingPath, identifier = null) => {
      const keys = settingPath.split(".");

      if (level === "global") {
        // Reset to default
        let defaultValue = { ...DEFAULT_FORMAT_SETTINGS };
        for (const key of keys) {
          defaultValue = defaultValue[key];
        }

        const category = keys[0];
        const newSettings = {
          ...globalSettings,
          [category]: {
            ...globalSettings[category],
            [keys[1]]: defaultValue,
          },
        };
        setGlobalSettings(newSettings);

        if (store) {
          await store.set("formatSettings_global", newSettings);
          await store.save();
        }
      } else if (level === "pageType" && identifier) {
        // Remove override
        const newSettings = { ...pageTypeSettings };
        if (newSettings[identifier]) {
          const category = keys[0];
          if (newSettings[identifier][category]) {
            delete newSettings[identifier][category][keys[1]];
          }
        }
        setPageTypeSettings(newSettings);

        if (store) {
          await store.set("formatSettings_pageTypes", newSettings);
          await store.save();
        }
      } else if (level === "page" && identifier) {
        // Remove override
        const newSettings = { ...pageSettings };
        if (newSettings[identifier]) {
          const category = keys[0];
          if (newSettings[identifier][category]) {
            delete newSettings[identifier][category][keys[1]];
          }
        }
        setPageSettings(newSettings);

        if (store) {
          await store.set("formatSettings_pages", newSettings);
          await store.save();
        }
      }
    },
    [globalSettings, pageTypeSettings, pageSettings, store],
  );

  return {
    globalSettings,
    pageTypeSettings,
    pageSettings,
    isLoading,
    updateGlobalSettings,
    updatePageTypeSettings,
    updatePageSettings,
    getEffectiveSettingsForPage,
    resetSetting,
  };
};
