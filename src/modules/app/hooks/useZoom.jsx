// useZoom.ts - Updated for CSS variable approach
import { use, useEffect, useState } from "react";
import { appStore } from "../stores/appStore";

const useZoom = () => {
  const [scale, setScale] = useState(1);
  const MIN_SCALE = 0.8;
  const MAX_SCALE = 1.5;
  const SCALE_STEP = 0.1;

  const setZoom = appStore((state) => state.setZoom);

  // Load saved scale from localStorage
  useEffect(() => {
    const savedScale = localStorage.getItem("uiScale");
    if (savedScale) {
      setScale(parseFloat(savedScale));
    }
  }, []);

  // Update CSS variable and save to localStorage
  useEffect(() => {
    document.documentElement.style.setProperty("--uiScale", scale.toString());

    setZoom(scale);
    localStorage.setItem("uiScale", scale.toString());
  }, [scale, setZoom]);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + SCALE_STEP, MAX_SCALE));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - SCALE_STEP, MIN_SCALE));
  };

  const handleKeyDown = (e) => {
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
          setScale(1);
          break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { scale, setScale, zoomIn, zoomOut };
};

export default useZoom;