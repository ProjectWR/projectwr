import React, { useState } from "react";
import { loadSettings, saveSettings } from "../../lib/settings";
import { settingsStore } from "../../stores/settingsStore";
import { startStore } from "../../stores/startStore";

const Settings = () => {
  const defaultSettings = settingsStore((state) => state.defaultSettings);
  const settings = settingsStore((state) => state.settings);
  const setSettings = settingsStore((state) => state.setSettings);
  const setActiveContent = startStore((state) => state.setActiveContent);

  // not using zustand here because these only affect the component's local state
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
    <div
      id="SettingsContainer"
      className="h-full w-full p-3"
    >
      <div id="SettingsCardContainer" className="container">
        {/* <div id="SettingsCardHeader" className='text-center flex'>
                    <h1 className='text-2xl'>Settings</h1>
                </div> */}
        <form className="h-full">
          <div
            id="SettingsCardBody"
            className="grid grid-cols-1 grid-rows-8 gap-3"
          >
            <div className="text-lg">
              <label htmlFor="name">Name: </label>
              <input
                className="p-1 dark:bg-zinc-900"
                type="text"
                name="name"
                id="name"
                value={newSettings.name}
                onChange={handleChange}
              />
            </div>

            <div className="text-lg">
              <label htmlFor="phone">Phone: </label>
              <input
                className="p-1 dark:bg-zinc-900"
                type="text"
                name="phone"
                id="phone"
                value={newSettings.phone}
                onChange={handleChange}
              />
            </div>

            <div className="text-lg">
              <label htmlFor="email">Email: </label>
              <input
                className="p-1 dark:bg-zinc-900"
                type="text"
                name="email"
                id="email"
                value={newSettings.email}
                onChange={handleChange}
              />
            </div>

            <div className="text-xl row-start-6">
              <button
                type="submit"
                onClick={handleSave}
                disabled={isSaveLoading}
              >
                {isSaveLoading ? "Saving..." : "Save"}
              </button>
            </div>

            <div className="text-xl row-start-7">
              <button
                type="submit"
                onClick={handleResetToDefault}
                disabled={isResetLoading}
              >
                {isResetLoading ? "Resetting..." : "Reset to Default"}
              </button>
            </div>

            <div className="text-xl row-start-8">
              <button type="button" onClick={() => setActiveContent("")}>
                Close
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
