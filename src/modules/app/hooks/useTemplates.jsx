import { useRef, useSyncExternalStore } from "react";
import templateManager from "../lib/templates";
import { equalityDeep } from "lib0/function";

const useTemplates = () => {
  const prevTemplatesRef = useRef(null);

  return useSyncExternalStore(
    (callback) => {
      templateManager.addCallback(callback);

      return () => {
        templateManager.removeCallback(callback);
      };
    },
    () => {
      const templates = templateManager.getTemplates();
      if (
        prevTemplatesRef.current !== null &&
        prevTemplatesRef.current !== undefined &&
        equalityDeep(prevTemplatesRef.current, templates)
      ) {
        return prevTemplatesRef.current;
      } else {
        prevTemplatesRef.current = templates;
        return prevTemplatesRef.current;
      }
    }
  );
};

export default useTemplates;
