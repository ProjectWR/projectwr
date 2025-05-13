import { useEffect, useRef, useState } from "react";
import { appStore } from "../stores/appStore";

// Create a helper hook
const useComputedCssVar = (varName) => {
  const [value, setValue] = useState(0);
  const testElRef = useRef(null);

  const zoom = appStore((state) => state.zoom);

  useEffect(() => {
    const testEl = document.createElement("div");
    testEl.style.width = `var(${varName})`;
    testEl.style.position = "absolute";
    testEl.style.visibility = "hidden";
    document.body.appendChild(testEl);
    testElRef.current = testEl;

    const updateValue = () => {
      setValue(parseFloat(getComputedStyle(testEl).width));
    };

    // Update on mount and resize
    updateValue();
    window.addEventListener("resize", updateValue);

    return () => {
      updateValue();
      window.removeEventListener("resize", updateValue);
      document.body.removeChild(testEl);
    };
  }, [varName, zoom]);

  return value;
};

export default useComputedCssVar;
