import { useState, useEffect, useCallback } from "react";
import { load } from "@tauri-apps/plugin-store";
import { DEFAULT_FORMAT_SETTINGS } from "../components/MainPanels/CompileManuscript/formatConstants";

const useFormatInfo = (libraryId) => {
  const [store, setStore] = useState(null);
  const [formatData, setFormatData] = useState({
    global: {},
    type: {},
    page: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initStore = async () => {
      if (!libraryId) return;
      try {
        const newStore = await load(`compile_manuscript_${libraryId}.json`);
        setStore(newStore);

        const savedFormatData = await newStore.get("formatData");
        if (savedFormatData) {
          // Merge with default structure to ensure all keys exist
          setFormatData({
            global: savedFormatData.global || {},
            type: savedFormatData.type || {},
            page: savedFormatData.page || {},
          });
        }
      } catch (err) {
        console.error("Failed to load format store:", err);
      } finally {
        setLoading(false);
      }
    };

    initStore();
  }, [libraryId]);

  const saveFormatData = useCallback(
    async (newData) => {
      if (store) {
        await store.set("formatData", newData);
        await store.save();
      }
    },
    [store],
  );

  const updateFormatValue = useCallback(
    (scope, id, section, key, value) => {
      setFormatData((prev) => {
        const newData = { ...prev };

        // Ensure structure exists
        if (scope === "global") {
          if (!newData.global) newData.global = {};
          // Handle nested keys (e.g. layout.pageSize)
          if (section) {
            if (!newData.global[section]) newData.global[section] = {};
            newData.global[section][key] = value;
          } else {
            newData.global[key] = value;
          }
        } else if (scope === "type") {
          if (!newData.type) newData.type = {};
          if (!newData.type[id]) newData.type[id] = {};

          if (section) {
            if (!newData.type[id][section]) newData.type[id][section] = {};
            newData.type[id][section][key] = value;
          } else {
            newData.type[id][key] = value;
          }
        } else if (scope === "page") {
          if (!newData.page) newData.page = {};
          if (!newData.page[id]) newData.page[id] = {};

          if (section) {
            if (!newData.page[id][section]) newData.page[id][section] = {};
            newData.page[id][section][key] = value;
          } else {
            newData.page[id][key] = value;
          }
        }

        saveFormatData(newData);
        return newData;
      });
    },
    [saveFormatData],
  );

  // Helper to get nested value safely
  const getNestedValue = (obj, section, key) => {
    if (!obj) return undefined;
    if (section && obj[section]) {
      return obj[section][key];
    }
    return obj[key]; // Fallback if not sectioned or if key is top level (unlikely with current constants but good for safety)
  };

  // Helper to get nested default value
  const getDefaultValue = (section, key) => {
    if (section && DEFAULT_FORMAT_SETTINGS[section]) {
      return DEFAULT_FORMAT_SETTINGS[section][key];
    }
    return undefined;
  };

  const getResolvedValue = useCallback(
    (scope, id, pageType, section, key) => {
      // Returns { value, source, isInherited }
      // scope: 'global', 'type', 'page' (current view)
      // id: itemId (for type or page)
      // pageType: type of the page (required if scope is 'page')
      // section: e.g. 'layout', 'typography'
      // key: e.g. 'fontSize'

      let val;

      // 1. Check Page Level
      if (scope === "page" && id) {
        val = getNestedValue(formatData.page[id], section, key);
        if (val !== undefined)
          return { value: val, source: "page", isInherited: false };
      }

      // 2. Check Type Level
      // If we are in 'page' scope, we check its type. If in 'type' scope, we check the current type id.
      const typeId = scope === "page" ? pageType : scope === "type" ? id : null;

      if (typeId) {
        val = getNestedValue(formatData.type[typeId], section, key);
        if (val !== undefined)
          return { value: val, source: "type", isInherited: scope === "page" };
      }

      // 3. Check Global Level
      val = getNestedValue(formatData.global, section, key);
      if (val !== undefined)
        return {
          value: val,
          source: "global",
          isInherited: scope !== "global",
        };

      // 4. Default
      return {
        value: getDefaultValue(section, key),
        source: "default",
        isInherited: true,
      };
    },
    [formatData],
  );

  return {
    formatData,
    loading,
    updateFormatValue,
    getResolvedValue,
  };
};

export default useFormatInfo;
