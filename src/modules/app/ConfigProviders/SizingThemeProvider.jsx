import { createContext, useContext, useEffect, useState } from "react";

// Initial state for the sizing context
const initialSizingState = {
  sizingMode: "normal",
  setSizingMode: (mode) => {},
};

// Create the context
const SizingProviderContext = createContext(initialSizingState);

// SizingProvider component
export function SizingProvider({
  children,
  defaultSizingMode = "normal",
  storageKey = "vite-ui-sizing",
  ...props
}) {
  const [sizingMode, setSizingMode] = useState(
    () => localStorage.getItem(storageKey) || defaultSizingMode
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all sizing classes
    root.classList.remove("big", "normal", "small");

    // Add the current sizing mode class
    root.classList.add(sizingMode);
  }, [sizingMode]);

  const value = {
    sizingMode,
    setSizingMode: (mode) => {
      localStorage.setItem(storageKey, mode);
      setSizingMode(mode);
    },
  };

  return (
    <SizingProviderContext.Provider {...props} value={value}>
      {children}
    </SizingProviderContext.Provider>
  );
}

// Custom hook to use the sizing context
export const useSizing = () => {
  const context = useContext(SizingProviderContext);

  if (context === undefined)
    throw new Error("useSizing must be used within a SizingProvider");

  return context;
};
