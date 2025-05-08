import { open } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile, exists, mkdir, remove, readDir } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';
import { v4 as uuidv4 } from 'uuid';

/** @type {FontManager} */
let instance;

class FontManager {
  constructor() {
    if (instance) {
      throw new Error('Use FontManager.getInstance() to get the singleton instance.');
    }

    this.fonts = new Map();
    this.callbacks = new Set();
    this.fontsDir = null;
  }

  static getInstance() {
    if (!instance) {
      throw new Error('FontManager instance not initialized. Call init() first.');
    }
    return instance;
  }

  async init() {
    const appDataDirPath = await appDataDir();
    this.fontsDir = await join(appDataDirPath, 'fonts');
    await mkdir(this.fontsDir, { recursive: true });
    await this.loadFontsOnInit();
  }

  async loadFontsOnInit() {
    console.log("loading fonts on init");
    try {
      const files = await readDir(this.fontsDir);

      for (const file of files) {
        if (!file.isFile) continue;

        const fileName = file.name;
        const parts = fileName.split('.');
        if (parts.length < 2) continue;

        const format = parts.pop().toLowerCase();
        if (!['ttf', 'otf', 'woff', 'woff2'].includes(format)) continue;

        const family = parts.shift();
        console.log("family: ", family);
        const fontPath = await join(this.fontsDir, fileName);
        const fontBuffer = await readFile(fontPath);

        await this.loadFontFace(family, fontBuffer, format);
        this.fonts.set(fileName, { id: fileName, family, format, fileName });
      }
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  }

  async loadFontFace(family, buffer, format) {
    const blob = new Blob([buffer], { type: `font/${format}` });
    const url = URL.createObjectURL(blob);
    const fontFace = new FontFace(family, `url(${url})`);

    await fontFace.load();
    document.fonts.add(fontFace);
    URL.revokeObjectURL(url);
  }

  async addFont() {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Fonts',
          extensions: ['ttf', 'otf', 'woff', 'woff2']
        }]
      });

      if (!selected) return;

      const fontBuffer = await readFile(selected);
      let fileName = selected.split('\\').pop();
      console.log("filename: ", fileName);

      let fontPath = await join(this.fontsDir, fileName);

      console.log("fontPath: ", fontPath);

      const parts = fileName.split('.');
      if (parts.length < 2) throw new Error('Invalid font file name');
      const format = parts.pop().toLowerCase();

      const family = parts.join('-');
      // Handle file name conflicts
      if (await exists(fontPath)) {
        throw new Error(`Font with name "${fileName}" already exists`);
      }

      console.log("writing font file now");

      await writeFile(fontPath, fontBuffer); 

      console.log("loading font now");

      await this.loadFontFace(family, fontBuffer, format);

      const fontData = { id: fileName, family: fileName.split('.').shift(), format, fileName };
      this.fonts.set(fileName, fontData);
      this.triggerCallbacks('added', fontData);

      return fileName;
    } catch (error) {
      console.error('Error adding font:', error);
      throw error;
    }
  }

  async addFontsFromPath(path) {
    
    console.log("adding fonts from path: ", path);

    const files = await readDir(path);

    console.log("files: ", files);

    for (const file of files) {
      if (!file.isFile) continue;

      const fileName = file.name;
      const parts = fileName.split('.');
      if (parts.length < 2) continue;

      const format = parts.pop().toLowerCase();
      if (!['ttf', 'otf', 'woff', 'woff2'].includes(format)) continue;

      const fontBuffer = await readFile(await join(path, fileName));

      try {
        console.log("filename: ", fileName);

        let fontPath = await join(this.fontsDir, fileName);

        console.log("fontPath: ", fontPath);

        const parts = fileName.split('.');
        if (parts.length < 2) throw new Error('Invalid font file name');
        const format = parts.pop().toLowerCase();

        const family = parts.shift();
        // Handle file name conflicts
        if (await exists(fontPath)) {
          continue;
        }

        console.log("writing font file now");

        await writeFile(fontPath, fontBuffer);

        console.log("loading font now");

        await this.loadFontFace(family, fontBuffer, format);

        const fontData = { id: fileName, family: fileName.split('.').shift(), format, fileName };
        this.fonts.set(fileName, fontData);
        this.triggerCallbacks('added', fontData);

        return fileName;
      } catch (error) {
        console.error('Error adding font:', error);
        throw error;
      }
    }
  }

  async promptFontName(defaultName) {
    // Implement your own UI dialog or use Tauri's dialog
    const name = prompt('Enter font family name:', defaultName.split('.')[0]);
    return name || defaultName.split('.')[0];
  }


  async deleteFont(id) {
    try {
      const fontData = this.fonts.get(id);
      if (!fontData) return;

      const fontPath = await join(this.fontsDir, id);
      await remove(fontPath);

      this.fonts.delete(id);
      this.triggerCallbacks('removed', fontData);

      return true;
    } catch (error) {
      console.error('Error deleting font:', error);
      throw error;
    }
  }

  getFontList() {
    return Array.from(this.fonts.values());
  }

  registerCallback(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  triggerCallbacks(eventType, fontData) {
    this.callbacks.forEach(callback => callback(eventType, fontData));
  }
}

const fontManager = new FontManager();

export default fontManager;