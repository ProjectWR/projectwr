import { useRef, useSyncExternalStore } from "react";
import { equalityDeep } from "lib0/function";
import imageManager from "../lib/image";

export function useImages() {
  const prevImagesRef = useRef(null);

  const subscribe = (callback) => {
    // Return the cleanup function
    return imageManager.registerCallback((eventType, fontData) => {
      // Trigger React update on any font change
      callback();
    });
  };

  const getSnapshot = () => {
    const fonts = imageManager.getImageList();
    if (
      prevImagesRef.current === null ||
      prevImagesRef.current === undefined ||
      !equalityDeep(prevImagesRef.current, fonts)
    ) {
      prevImagesRef.current = fonts;
      return prevImagesRef.current;
    } else {
      return prevImagesRef.current;
    }
  };

  return useSyncExternalStore(subscribe, getSnapshot);
}
