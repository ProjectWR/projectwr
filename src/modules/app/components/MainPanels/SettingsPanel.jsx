import { useState } from "react";
import { useDeviceType } from "../../ConfigProviders/DeviceTypeProvider";
import { settingsStore } from "../../stores/settingsStore";
import { loadSettings, saveSettings } from "../../lib/settings";

const SettingsPanel = () => {
  const { deviceType } = useDeviceType();
  const defaultSettings = settingsStore((state) => state.defaultSettings);
  const settings = settingsStore((state) => state.settings);

  const setSettings = settingsStore((state) => state.setSettings);

  const [newSettings, setNewSettings] = useState(settings);
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSettings({
      ...newSettings,
      [name]: value,
    });
  };

  const handleSave = () => {
    setIsSaveLoading(true);
    (async () => {
      try {
        await saveSettings(newSettings);
        const loadedSettings = await loadSettings();

        setSettings(loadedSettings);
        setNewSettings(loadedSettings);
      } catch (error) {
        console.error("Error saving settings: ", error);
      } finally {
        setIsSaveLoading(false);
      }
    })();
  };

  const handleResetToDefault = () => {
    setIsResetLoading(true);
    (async () => {
      try {
        await saveSettings(defaultSettings);
        const loadedSettings = await loadSettings();

        setSettings(loadedSettings);

        setNewSettings(loadedSettings);
      } catch (error) {
        console.error("Error saving settings: ", error);
      } finally {
        setIsResetLoading(false);
      }
    })();
  };

  return (
    <div id="SettingsContainer" className={`h-full w-full flex flex-col`}>
      <div
        id="SettingsHeader"
        className={`flex items-center justify-between px-1 h-libraryManagerHeaderHeight min-h-libraryManagerHeaderHeight border-b border-appLayoutBorder shadow-sm shadow-appLayoutShadow`}
      >
        <h1 className="h-fit w-fit pt-1 pb-[0.38rem] ml-4 text-libraryManagerHeaderText text-neutral-300 order-2">
          Settings
        </h1>{" "}
        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-4
 `}
          onClick={handleResetToDefault}
        >
          <span className="icon-[material-symbols-light--reset-settings]] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
        <button
          className={`w-libraryManagerAddButtonSize h-libraryManagerAddButtonSize transition-colors duration-200 p-1 mr-1 rounded-full hover:bg-appLayoutInverseHover hover:text-appLayoutHighlight flex items-center justify-center order-4
 `}
          onClick={handleSave}
        >
          <span className="icon-[material-symbols-light--check-rounded] hover:text-appLayoutHighlight rounded-full w-full h-full"></span>
        </button>
      </div>

      <div
        id="SettingsBody"
        className={`flex-grow flex flex-col w-full justify-start items-center overflow-y-scroll ${
          deviceType === "mobile" ? "no-scrollbar" : "pl-[0.75rem]"
        }`}
      >
        

      </div>
    </div>
  );
};

export default SettingsPanel;
