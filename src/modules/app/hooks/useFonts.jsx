import { useRef, useSyncExternalStore } from "react";
import fontManager from "../lib/font";
import { equalityDeep } from "lib0/function";

export function useFonts() {
  const prevFontsRef = useRef(null);

  const subscribe = (callback) => {
    // Return the cleanup function
    return fontManager.registerCallback((eventType, fontData) => {
      // Trigger React update on any font change
      callback();
    });
  };

  const getSnapshot = () => {
    const fonts = fontManager.getFontList();
    if (prevFontsRef.current === null || prevFontsRef.current === undefined || !equalityDeep(prevFontsRef.current, fonts)) {
      prevFontsRef.current = fonts;
      return prevFontsRef.current;
    }
    else {
      return prevFontsRef.current;
    }
  };

  return useSyncExternalStore(subscribe, getSnapshot);
}
