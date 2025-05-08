import { open } from '@tauri-apps/plugin-dialog';
import { readFile, writeFile, exists, mkdir, remove, readDir } from '@tauri-apps/plugin-fs';
import { appDataDir, join } from '@tauri-apps/api/path';

/** @type {ImageManager} */
let imageInstance;

class ImageManager {
  constructor() {
    if (imageInstance) {
      throw new Error('Use ImageManager.getInstance() to get the singleton instance.');
    }

    this.images = new Map();
    this.callbacks = new Set();
    this.imagesDir = null;
  }

  static getInstance() {
    if (!imageInstance) {
      throw new Error('ImageManager instance not initialized. Call init() first.');
    }
    return imageInstance;
  }

  async init() {
    const appDataDirPath = await appDataDir();
    this.imagesDir = await join(appDataDirPath, 'images');
    await mkdir(this.imagesDir, { recursive: true });
    await this.loadImagesOnInit();
    imageInstance = this;
  }

  async loadImagesOnInit() {
    try {
      const files = await readDir(this.imagesDir);

      for (const file of files) {
        if (!file.isFile) continue;

        const fileName = file.name;
        const parts = fileName.split('.');
        if (parts.length < 2) continue;

        const extension = parts.pop().toLowerCase();
        const name = parts.join('.');
        const mimeType = this.getMimeType(extension);
        if (!mimeType) continue;

        const imagePath = await join(this.imagesDir, fileName);
        const imageBuffer = await readFile(imagePath);
        const url = await this.createImageUrl(imageBuffer, mimeType);

        this.images.set(fileName, {
          id: fileName,
          fileName,
          url,
          mimeType,
          name,
          extension
        });
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  getMimeType(extension) {
    const types = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml'
    };
    return types[extension] || null;
  }

  async createImageUrl(buffer, mimeType) {
    const blob = new Blob([buffer], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  async addImage() {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
        }]
      });

      if (!selected) return;

      const imageBuffer = await readFile(selected);
      const originalFileName = selected.split('\\').pop();
      const parts = originalFileName.split('.');
      if (parts.length < 2) throw new Error('Invalid image file name');

      const extension = parts.pop().toLowerCase();
      const originalName = parts.join('.');
      const mimeType = this.getMimeType(extension);

      if (!mimeType) throw new Error('Unsupported image format');

      // Get filename from user
      let fileName = "sdasfsas";
      if (!fileName) return null;

      // Handle conflicts
      let counter = 1;
      let baseName = fileName.replace(/\.[^/.]+$/, "");
      while (await exists(await join(this.imagesDir, fileName))) {
        fileName = `${baseName} (${counter++}).${extension}`;
      }

      const imagePath = await join(this.imagesDir, fileName);
      await writeFile(imagePath, imageBuffer);
      const url = await this.createImageUrl(imageBuffer, mimeType);

      const imageData = {
        id: fileName,
        fileName,
        url,
        mimeType,
        name: fileName.split('.').slice(0, -1).join('.'),
        extension,
        originalFileName
      };

      this.images.set(fileName, imageData);
      this.triggerCallbacks('added', imageData);

      return imageData;
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  }

  async promptFileName(defaultName, extension) {
    const newName = await prompt('Enter image name:', {
      title: 'Save Image As',
      defaultInput: defaultName
    });

    if (!newName) return null;

    // Sanitize filename
    const sanitized = newName
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    return `${sanitized}.${extension}`;
  }

  async deleteImage(id) {
    try {
      const imageData = this.images.get(id);
      if (!imageData) return;

      const imagePath = await join(this.imagesDir, imageData.fileName);
      await remove(imagePath);
      URL.revokeObjectURL(imageData.url);

      this.images.delete(id);
      this.triggerCallbacks('removed', imageData);

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  getImageList() {
    return Array.from(this.images.values());
  }

  registerCallback(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  triggerCallbacks(eventType, imageData) {
    this.callbacks.forEach(callback => callback(eventType, imageData));
  }

  async cleanup() {
    for (const [id, imageData] of this.images) {
      URL.revokeObjectURL(imageData.url);
    }
    this.images.clear();
  }
}

const imageManager = new ImageManager();

export default imageManager;