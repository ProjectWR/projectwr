import { useRef, useSyncExternalStore } from "react";
import { equalityCustomDepth } from "../utils/miscUtil";

/**
 *
 * @param {YMap} itemEntriesMapReference
 *
 */
const useItemEntriesMap = (itemEntriesMapReference) => {
  const prevDataRef = useRef(null);
  return useSyncExternalStore(
    (callback) => {
      itemEntriesMapReference.observe(callback);

      itemEntriesMapReference.forEach((itemEntryReference) => {
        itemEntryReference.observe(callback);
      });

      return () => {
        itemEntriesMapReference.forEach((itemEntryReference) => {
          itemEntryReference.unobserve(callback);
        });
        
        itemEntriesMapReference.unobserve(callback);
      };
    },
    () => {
      if (
        prevDataRef.current !== undefined &&
        prevDataRef.current !== null &&
        equalityCustomDepth(
          prevDataRef.current,
          itemEntriesMapReference.toJSON(),
          2
        )
      ) {
        return prevDataRef.current;
      } else {
        prevDataRef.current = itemEntriesMapReference.toJSON();
        return prevDataRef.current;
      }
    }
  );
};

export default useItemEntriesMap;
