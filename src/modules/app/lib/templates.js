import { appDataDir, join } from '@tauri-apps/api/path';
import { mkdir, exists, readDir, readTextFile, remove, rename, writeTextFile } from '@tauri-apps/plugin-fs';
import fontManager from './font';

let instance;

class TemplateManager {
  constructor() {
    if (instance) {
      throw new Error("TemplateManager is a singleton class. Use getInstance() instead.");
    }

    this.callbacks = new Set();
    this.templatesDirName = 'templates';
    this.templatesDirPath = '';
    instance = this;
  }

  async initialize() {
    this.templatesDirPath = await join(await appDataDir(), this.templatesDirName);

    // Ensure templates directory exists
    if (!await exists(this.templatesDirPath)) {
      await mkdir(this.templatesDirPath, { recursive: true });
    }

    await this.getTemplates();
  }

  addCallback(callback) {
    this.callbacks.add(callback);
  }

  removeCallback(callback) {
    this.callbacks.delete(callback);
  }

  _triggerCallbacks(eventType, template) {
    this.callbacks.forEach(callback => callback(eventType, template));
  }

  async getTemplate(templateId) {
    try {
      const entries = await readDir(this.templatesDirPath);

      console.log("ENTRIES: ", entries);

      try {
        const stylePath = await join(this.templatesDirPath, templateId, 'style.json');
        const content = await readTextFile(stylePath);
        const templateData = JSON.parse(content);

        console.log("TEMPLATE DATA", templateData);

        return templateData;

      } catch (e) {
        console.error(`Error reading templates:`, e);
      }


    } catch (e) {
      console.error('Error reading templates directory:', e);
      return {};
    }
  }

  async getTemplates() {
    const templates = {};

    try {
      const entries = await readDir(this.templatesDirPath);

      console.log("ENTRIES: ", entries);

      for (const entry of entries) {
        console.log("ENTRY: ", entry);
        if (entry?.isDirectory) { // Check if it's a directory
          try {
            const stylePath = await join(this.templatesDirPath, entry.name, 'style.json');
            const content = await readTextFile(stylePath);
            const templateData = JSON.parse(content);

            await fontManager.addFontsFromPath(await join(this.templatesDirPath, entry.name), entry.name);

            // Ensure template_id matches folder name
            templates[entry.name] = {
              ...templateData,
              template_id: entry.name
            };
          } catch (e) {
            console.error(`Error reading template ${entry.name}:`, e);
          }
        }
      }
    } catch (e) {
      console.error('Error reading templates directory:', e);
      return {};
    }

    return templates;
  }

  async createTemplate(templateName, templateProps) {
    const templatePath = await join(this.templatesDirPath, templateName);

    try {
      if (await exists(templatePath)) {
        throw new Error(`Template "${templateName}" already exists`);
      }

      await mkdir(templatePath, { recursive: true });

      const templateData = {
        ...templateProps,
        template_id: templateName
      };

      const stylePath = await join(templatePath, 'style.json');
      await writeTextFile(stylePath, JSON.stringify(templateData));

      this._triggerCallbacks('added', templateData);
      return templateName;
    } catch (e) {
      console.error('Error creating template:', e);
      throw e;
    }
  }

  async deleteTemplate(templateName) {
    const templatePath = await join(this.templatesDirPath, templateName);

    try {
      if (!await exists(templatePath)) {
        throw new Error(`Template "${templateName}" not found`);
      }

      const stylePath = await join(templatePath, 'style.json');
      const content = await readTextFile(stylePath);
      const deletedTemplate = JSON.parse(content);

      await remove(templatePath, { recursive: true });

      this._triggerCallbacks('removed', deletedTemplate);
    } catch (e) {
      console.error('Error deleting template:', e);
      throw e;
    }
  }

  async updateTemplate(templateName, updatedProps) {
    try {
      const templatePath = await join(this.templatesDirPath, templateName);
      const stylePath = await join(templatePath, 'style.json');

      if (!await exists(stylePath)) {
        throw new Error(`Template "${templateName}" not found`);
      }

      const content = await readTextFile(stylePath);
      const existingData = JSON.parse(content);
      const newData = {
        ...existingData,
        ...updatedProps,
        template_id: templateName
      };

      await writeTextFile(stylePath, JSON.stringify(newData));
      this._triggerCallbacks('updated', newData);
    } catch (e) {
      console.error('Error updating template:', e);
      throw e;
    }
  }

  async renameTemplate(oldName, newName) {
    const oldPath = await join(this.templatesDirPath, oldName);
    const newPath = await join(this.templatesDirPath, newName);

    try {
      if (!await exists(oldPath)) {
        throw new Error(`Template "${oldName}" not found`);
      }

      if (await exists(newPath)) {
        throw new Error(`Template "${newName}" already exists`);
      }

      // Read existing data
      const stylePath = await join(oldPath, 'style.json');
      const content = await readTextFile(stylePath);
      const templateData = JSON.parse(content);

      // Rename directory
      await rename(oldPath, newPath);

      // Update template_id in JSON
      const updatedData = { ...templateData, template_id: newName };
      const newStylePath = await join(newPath, 'style.json');
      await writeTextFile(newStylePath, JSON.stringify(updatedData));

      this._triggerCallbacks('removed', templateData);
      this._triggerCallbacks('added', updatedData);

      return newName;
    } catch (e) {
      console.error('Error renaming template:', e);
      throw e;
    }
  }
}

// Initialize the manager immediately
const templateManager = new TemplateManager();

export default templateManager;