import { useRef, useSyncExternalStore } from "react";
import { equalityCustomDepth } from "../utils/miscUtil";

const useLibrariesMap = (yMapReference) => {
  const prevDataRef = useRef(null);
  return useSyncExternalStore(
    (callback) => {
      yMapReference.observe(callback);

      yMapReference.forEach((libraryEntryReference) => {
        libraryEntryReference.observe(callback);
      });

      return () => {
        yMapReference.forEach((libraryEntryReference) => {
          libraryEntryReference.unobserve(callback);
        });
        yMapReference.unobserve(callback);
      };
    },
    () => {
      if (
        prevDataRef.current !== undefined &&
        prevDataRef.current !== null &&
        equalityCustomDepth(prevDataRef.current, yMapReference.toJSON(), 2)
      ) {
        return prevDataRef.current;
      } else {
        prevDataRef.current = yMapReference.toJSON();
        return prevDataRef.current;
      }
    }
  );
};

export default useLibrariesMap;
