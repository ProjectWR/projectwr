import { useRef, useSyncExternalStore } from "react";
import { equalityDeep } from "lib0/function";

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
        equalityDeep(prevDataRef.current, yMapReference.toJSON())
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
