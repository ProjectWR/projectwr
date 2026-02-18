import { useState, useEffect, useCallback } from "react";
import { load } from "@tauri-apps/plugin-store";
import { DEFAULT_FORMAT_SETTINGS } from "../components/MainPanels/CompileManuscript/formatConstants";

const useFormatInfo = (libraryId) => {
  const [store, setStore] = useState(null);
  const [formatData, setFormatData] = useState({
    global: {},
    category: {},
    item: {},
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
            category: savedFormatData.category || {},
            item: savedFormatData.item || {},
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
        } else if (scope === "category") {
          if (!newData.category) newData.category = {};
          if (!newData.category[id]) newData.category[id] = {};

          if (section) {
            if (!newData.category[id][section])
              newData.category[id][section] = {};
            newData.category[id][section][key] = value;
          } else {
            newData.category[id][key] = value;
          }
        } else if (scope === "item") {
          if (!newData.item) newData.item = {};
          if (!newData.item[id]) newData.item[id] = {};

          if (section) {
            if (!newData.item[id][section]) newData.item[id][section] = {};
            newData.item[id][section][key] = value;
          } else {
            newData.item[id][key] = value;
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
    (scope, id, itemCategory, section, key) => {
      // Returns { value, source, isInherited }
      // scope: 'global', 'category', 'item' (current view)
      // id: itemId (for category or item)
      // itemCategory: category of the item (required if scope is 'item')
      // section: e.g. 'layout', 'typography'
      // key: e.g. 'fontSize'

      let val;

      // 1. Check Item Level
      if (scope === "item" && id) {
        val = getNestedValue(formatData.item[id], section, key);
        if (val !== undefined)
          return { value: val, source: "item", isInherited: false };
      }

      // 2. Check Category Level
      // If we are in 'item' scope, we check its category. If in 'category' scope, we check the current category id.
      const categoryId =
        scope === "item" ? itemCategory : scope === "category" ? id : null;

      if (categoryId) {
        val = getNestedValue(formatData.category[categoryId], section, key);
        if (val !== undefined)
          return {
            value: val,
            source: "category",
            isInherited: scope === "item",
          };
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
