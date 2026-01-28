import { useState, useEffect } from "react";
import appThemeManager from "../lib/appTheme";

export const useAppThemesList = () => {
  const [themes, setThemes] = useState({});

  useEffect(() => {
    const fetchThemes = async () => {
      const themesList = await appThemeManager.getThemes();
      setThemes(themesList);
    };

    const callback = () => fetchThemes();
    appThemeManager.addCallback(callback);
    fetchThemes();

    return () => appThemeManager.removeCallback(callback);
  }, []);

  return themes;
};

export default useAppThemesList;
