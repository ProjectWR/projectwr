import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { appStore } from "../../stores/appStore";
import appThemeManager from "../../lib/appTheme";
import { equalityDeep, equalityFlat } from "lib0/function";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import AppThemeContentEditor from "./AppThemeContentEditor";
import DetailsPanel from "../LayoutComponents/DetailsPanel/DetailsPanel";
import DetailsPanelHeader from "../LayoutComponents/DetailsPanel/DetailsPanelHeader";
import DetailsPanelDivider from "../LayoutComponents/DetailsPanel/DetailsPanelDivider";
import { DetailsPanelBody } from "../LayoutComponents/DetailsPanel/DetailsPanelBody";
import { DetailsPanelNameInput } from "../LayoutComponents/DetailsPanel/DetailsPanelNameInput";
import useMainPanel from "../../hooks/useMainPanel";
import { DetailsPanelButtonOnClick } from "../LayoutComponents/DetailsPanel/DetailsPanelSubmitButton";
import { hslaToHexa, hexaToHsla } from "../../lib/colorUtils";
import { appThemeConfig } from "./Templates/appThemeConfig";

const AppThemeDetailsPanel = ({ themeId }) => {
  const { deviceType } = useDeviceType();
  const { activatePanel } = useMainPanel();

  const setPanelOpened = appStore((state) => state.setPanelOpened);

  const [themeName, setThemeName] = useState(themeId);
  const [themeFromFile, setThemeFromFile] = useState(null);
  const [newTheme, setNewTheme] = useState(null);
  const [themeValid, setThemeValid] = useState(true);

  const wasThemeNameChanged = useMemo(
    () => !equalityFlat(themeName, themeId),
    [themeId, themeName],
  );

  const wasThemeChanged = useMemo(
    () => !equalityDeep(themeFromFile, newTheme),
    [newTheme, themeFromFile],
  );

  const handleSave = useCallback(() => {
    if (themeValid && wasThemeChanged) {
      const hslaTheme = Object.fromEntries(
        Object.entries(newTheme).map(([k, v]) => [
          k,
          appThemeConfig[k] ? hexaToHsla(v) : v,
        ]),
      );
      appThemeManager.updateTheme(themeId, hslaTheme);
    }
  }, [newTheme, themeId, wasThemeChanged, themeValid]);

  useEffect(() => {
    const callback = async () => {
      try {
        const themeJSON = await appThemeManager.getTheme(themeId);
        const hexaTheme = Object.fromEntries(
          Object.entries(themeJSON).map(([k, v]) => [
            k,
            appThemeConfig[k] ? hslaToHexa(v) : v,
          ]),
        );
        setThemeFromFile(hexaTheme);
        setNewTheme(hexaTheme);
      } catch (e) {
        console.error(`Error finding theme with name ${themeId}:`, e);
        setThemeFromFile(null);
        setNewTheme(null);
      }
    };

    appThemeManager.addCallback(callback);
    callback();

    return () => {
      appThemeManager.removeCallback(callback);
    };
  }, [themeId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleNameChange = (e) => setThemeName(e.target.value);

  const handleNameSave = useCallback(async () => {
    await appThemeManager.renameTheme(themeId, themeName);
    await activatePanel("appThemes", "details", [themeName]);
  }, [activatePanel, themeId, themeName]);

  return (
    <DetailsPanel>
      <DetailsPanelHeader>
        {deviceType === "mobile" && (
          <button
            className="w-libraryManagerAddButtonSize min-w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mx-1 rounded-full hover:bg-appLayoutHover hover:text-appLayoutHighlight flex items-center justify-center order-first"
            onClick={() => {
              setPanelOpened(true);
              // setAppThemeId("unselected");
            }}
          >
            <span className="icon-[material-symbols-light--arrow-back-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
          </button>
        )}

        <DetailsPanelButtonOnClick
          exist={wasThemeNameChanged}
          onClick={handleNameSave}
        />

        <DetailsPanelNameInput
          name="theme_name"
          onChange={handleNameChange}
          value={themeName}
        />

        <DetailsPanelButtonOnClick
          exist={themeValid && wasThemeChanged}
          onClick={handleSave}
        />
      </DetailsPanelHeader>

      <DetailsPanelDivider />

      <DetailsPanelBody>
        {themeFromFile && newTheme && (
          <AppThemeContentEditor
            newTheme={newTheme}
            setNewTheme={setNewTheme}
            setThemeValid={setThemeValid}
          />
        )}
      </DetailsPanelBody>
    </DetailsPanel>
  );
};

AppThemeDetailsPanel.propTypes = {
  themeId: PropTypes.string.isRequired,
};

export default AppThemeDetailsPanel;
