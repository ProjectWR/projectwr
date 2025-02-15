import { useContext } from "react";

// Custom hook to use the sizing context
export const useSizing = () => {
    const context = useContext(SizingPr);
  
    if (context === undefined)
      throw new Error("useSizing must be used within a SizingProvider");
  
    return context;
  };
  