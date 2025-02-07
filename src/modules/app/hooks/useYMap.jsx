import { useRef, useSyncExternalStore } from "react";
import { equalityCustomDepth } from "../utils/miscUtil";

const useYMap = (yMapReference) => {
  const prevDataRef = useRef(null);
  return useSyncExternalStore(
    (callback) => {
      yMapReference.observe(callback);

      return () => {
        yMapReference.unobserve(callback);
      };
    },
    () => {
      if (
        prevDataRef.current !== undefined &&
        prevDataRef.current !== null &&
        equalityCustomDepth(prevDataRef.current, yMapReference.toJSON(), 1, 0)
      ) {
        return prevDataRef.current;
      } else {
        prevDataRef.current = yMapReference.toJSON();
        return prevDataRef.current;
      }
    }
  );
};

export default useYMap;
