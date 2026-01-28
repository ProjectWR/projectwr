import { useEffect, useCallback } from "react";
import { appThemeDefaultPreferences } from "../lib/appThemeDefaultPreferences";

const useApplyTheme = (themeData) => {
  const applyTheme = useCallback((theme) => {
    if (!theme) return;

    // Use default preferences as a base to ensure all variables are set
    const finalTheme = { ...appThemeDefaultPreferences, ...theme };

    Object.entries(finalTheme).forEach(([key, value]) => {
      const variableName = key.startsWith("--") ? key : `--${key}`;
      document.documentElement.style.setProperty(variableName, value);
    });
  }, []);

  const clearTheme = useCallback(() => {
    Object.keys(appThemeDefaultPreferences).forEach((key) => {
      const variableName = key.startsWith("--") ? key : `--${key}`;
      document.documentElement.style.removeProperty(variableName);
    });
  }, []);

  useEffect(() => {
    if (themeData) {
      applyTheme(themeData);
    } else {
      clearTheme();
    }
  }, [themeData, applyTheme, clearTheme]);

  return applyTheme;
};

export default useApplyTheme;
