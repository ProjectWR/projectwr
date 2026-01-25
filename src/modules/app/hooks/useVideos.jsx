import { useRef, useSyncExternalStore } from "react";
import { equalityDeep } from "lib0/function";
import videoManager from "../lib/video";

export function useVideos() {
  const prevVideosRef = useRef(null);

  const subscribe = (callback) => {
    // Return the cleanup function
    return videoManager.registerCallback((eventType, videoData) => {
      // Trigger React update on any video change
      callback();
    });
  };

  const getSnapshot = () => {
    const videos = videoManager.getVideoList();
    if (
      prevVideosRef.current === null ||
      prevVideosRef.current === undefined ||
      !equalityDeep(prevVideosRef.current, videos)
    ) {
      prevVideosRef.current = videos;
      return prevVideosRef.current;
    } else {
      return prevVideosRef.current;
    }
  };

  return useSyncExternalStore(subscribe, getSnapshot);
}
