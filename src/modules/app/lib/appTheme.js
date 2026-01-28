import { appDataDir, join } from "@tauri-apps/api/path";
import {
  mkdir,
  exists,
  readDir,
  readTextFile,
  remove,
  rename,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

let instance;

class AppThemeManager {
  constructor() {
    if (instance) {
      throw new Error(
        "AppThemeManager is a singleton class. Use getInstance() instead.",
      );
    }

    this.callbacks = new Set();
    this.themesDirName = "app_themes";
    this.themesDirPath = "";
    instance = this;
  }

  async initialize() {
    this.themesDirPath = await join(await appDataDir(), this.themesDirName);

    // Ensure themes directory exists
    if (!(await exists(this.themesDirPath))) {
      await mkdir(this.themesDirPath, { recursive: true });
    }

    await this.getThemes();
  }

  addCallback(callback) {
    this.callbacks.add(callback);
  }

  removeCallback(callback) {
    this.callbacks.delete(callback);
  }

  _triggerCallbacks(eventType, theme) {
    this.callbacks.forEach((callback) => callback(eventType, theme));
  }

  async getTheme(themeId) {
    try {
      if (!this.themesDirPath) await this.initialize();

      const themePath = await join(this.themesDirPath, themeId, "theme.json");
      if (!(await exists(themePath))) return null;

      const content = await readTextFile(themePath);
      const themeData = JSON.parse(content);
      return themeData;
    } catch (e) {
      console.error(`Error reading theme ${themeId}:`, e);
      return null;
    }
  }

  async getThemes() {
    const themes = {};

    try {
      if (!this.themesDirPath) await this.initialize();

      const entries = await readDir(this.themesDirPath);

      for (const entry of entries) {
        if (entry?.isDirectory) {
          try {
            const themePath = await join(
              this.themesDirPath,
              entry.name,
              "theme.json",
            );
            if (await exists(themePath)) {
              const content = await readTextFile(themePath);
              const themeData = JSON.parse(content);
              themes[entry.name] = {
                ...themeData,
                theme_id: entry.name,
              };
            }
          } catch (e) {
            console.error(`Error reading theme ${entry.name}:`, e);
          }
        }
      }
    } catch (e) {
      console.error("Error reading themes directory:", e);
      return {};
    }

    return themes;
  }

  async createTheme(themeName, themeProps) {
    try {
      if (!this.themesDirPath) await this.initialize();
      const themePath = await join(this.themesDirPath, themeName);

      if (await exists(themePath)) {
        throw new Error(`Theme "${themeName}" already exists`);
      }

      await mkdir(themePath, { recursive: true });

      const themeData = {
        ...themeProps,
        theme_id: themeName,
      };

      const filePath = await join(themePath, "theme.json");
      await writeTextFile(filePath, JSON.stringify(themeData));

      this._triggerCallbacks("added", themeData);
      return themeName;
    } catch (e) {
      console.error("Error creating theme:", e);
      throw e;
    }
  }

  async deleteTheme(themeName) {
    try {
      if (!this.themesDirPath) await this.initialize();
      const themePath = await join(this.themesDirPath, themeName);

      if (!(await exists(themePath))) {
        throw new Error(`Theme "${themeName}" not found`);
      }

      const filePath = await join(themePath, "theme.json");
      const content = await readTextFile(filePath);
      const deletedTheme = JSON.parse(content);

      await remove(themePath, { recursive: true });

      this._triggerCallbacks("removed", deletedTheme);
    } catch (e) {
      console.error("Error deleting theme:", e);
      throw e;
    }
  }

  async updateTheme(themeName, updatedProps) {
    try {
      if (!this.themesDirPath) await this.initialize();
      const themePath = await join(this.themesDirPath, themeName);
      const filePath = await join(themePath, "theme.json");

      if (!(await exists(filePath))) {
        throw new Error(`Theme "${themeName}" not found`);
      }

      const content = await readTextFile(filePath);
      const existingData = JSON.parse(content);
      const newData = {
        ...existingData,
        ...updatedProps,
        theme_id: themeName,
      };

      await writeTextFile(filePath, JSON.stringify(newData));
      this._triggerCallbacks("updated", newData);
    } catch (e) {
      console.error("Error updating theme:", e);
      throw e;
    }
  }

  async renameTheme(oldName, newName) {
    try {
      if (!this.themesDirPath) await this.initialize();
      const oldPath = await join(this.themesDirPath, oldName);
      const newPath = await join(this.themesDirPath, newName);

      if (!(await exists(oldPath))) {
        throw new Error(`Theme "${oldName}" not found`);
      }

      if (await exists(newPath)) {
        throw new Error(`Theme "${newName}" already exists`);
      }

      const oldFilePath = await join(oldPath, "theme.json");
      const content = await readTextFile(oldFilePath);
      const themeData = JSON.parse(content);

      await rename(oldPath, newPath);

      const updatedData = { ...themeData, theme_id: newName };
      const newFilePath = await join(newPath, "theme.json");
      await writeTextFile(newFilePath, JSON.stringify(updatedData));

      this._triggerCallbacks("removed", themeData);
      this._triggerCallbacks("added", updatedData);

      return newName;
    } catch (e) {
      console.error("Error renaming theme:", e);
      throw e;
    }
  }
}

const appThemeManager = new AppThemeManager();
export default appThemeManager;
