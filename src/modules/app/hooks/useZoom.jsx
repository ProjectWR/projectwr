// useZoom.ts - Updated for CSS variable approach
import { useCallback, useEffect } from "react";
import { appStore } from "../stores/appStore";
import { saveSettings } from "../lib/settings";

const useZoom = () => {
  const MIN_SCALE = 0.8;
  const MAX_SCALE = 1.3;
  const SCALE_STEP = 0.1;

  const zoom = appStore((state) => state.zoom);
  const setZoom = appStore((state) => state.setZoom);

  // Update CSS variable and save to localStorage
  useEffect(() => {
    document.documentElement.style.setProperty("--uiScale", zoom.toString());
  }, [zoom]);

  const zoomIn = () => {
    setZoom((prev) => {
      if (prev) {
        const value = Math.min(prev + SCALE_STEP, MAX_SCALE);
        saveSettings({ ui_scale: value });

        return value;
      }
    });
  };

  const zoomOut = () => {
    setZoom((prev) => {
      if (prev) {
        const value = Math.max(prev - SCALE_STEP, MIN_SCALE);
        saveSettings({ ui_scale: value });
        return value;
      }
    });
  };

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          e.preventDefault();
          setZoom(1);
          break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { zoomIn, zoomOut };
};

export default useZoom;
