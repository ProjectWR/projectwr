import { useRef, useSyncExternalStore } from "react";
import { equalityCustomDepth } from "../utils/miscUtil";
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
      console.log("CHECKING IF YMAP WAS UPDATING IN USE YMAP", prevDataRef.current, yMapReference.toJSON());
      if (
        prevDataRef.current !== undefined &&
        prevDataRef.current !== null &&
        equalityDeep(prevDataRef.current, yMapReference.toJSON())
      ) {
        return prevDataRef.current;
      } else {
        console.log("YMAP UPDATED IN USE YMAP");
        prevDataRef.current = yMapReference.toJSON();
        return prevDataRef.current;
      }
    }
  );
};

export default useYMap;
