import { load } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";

let settings = await load("settings.json");
console.log("HERE");
await fillInDefaultSettings();

export async function saveSettings(newSettings) {
  for (const [key, value] of Object.entries(newSettings)) {
    await settings.set(key, value);
  }

  await settings.save();
}

export async function loadSettings() {
  const keys = await settings.keys();
  const allSettings = {};
  for (const key of keys) {
    allSettings[key] = await settings.get(key);
  }

  return allSettings;
}

export async function loadDefaultSettings() {
  try {
    const settings = await invoke("fetch_default_settings");
    return settings;
  } catch (error) {
    console.error("Failed to fetch default settings: ", error);
    return null;
  }
}

async function fillInDefaultSettings() {
  const defaultSettings = await loadDefaultSettings();
  for (const [key, value] of Object.entries(defaultSettings)) {
    const settingHasKey = await settings.has(key);
    if (!settingHasKey) {
      await settings.set(key, value);
    }
  }
}
