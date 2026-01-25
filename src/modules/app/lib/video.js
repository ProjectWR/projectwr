import { open } from "@tauri-apps/plugin-dialog";
import {
  readFile,
  writeFile,
  exists,
  mkdir,
  remove,
  readDir,
} from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";

/** @type {VideoManager} */
let videoInstance;

class VideoManager {
  constructor() {
    if (videoInstance) {
      throw new Error(
        "Use VideoManager.getInstance() to get the singleton instance.",
      );
    }

    this.videos = new Map();
    this.callbacks = new Set();
    this.videosDir = null;
  }

  static getInstance() {
    if (!videoInstance) {
      throw new Error(
        "VideoManager instance not initialized. Call init() first.",
      );
    }
    return videoInstance;
  }

  async init() {
    const appDataDirPath = await appDataDir();
    this.videosDir = await join(appDataDirPath, "videos");
    await mkdir(this.videosDir, { recursive: true });
    await this.loadVideosOnInit();
  }

  async loadVideosOnInit() {
    try {
      const files = await readDir(this.videosDir);

      for (const file of files) {
        if (!file.isFile) continue;

        const fileName = file.name;
        const parts = fileName.split(".");
        if (parts.length < 2) continue;

        const extension = parts.pop().toLowerCase();
        const name = parts.join(".");
        const mimeType = this.getMimeType(extension);
        if (!mimeType) continue;

        const videoPath = await join(this.videosDir, fileName);
        const videoBuffer = await readFile(videoPath);
        const url = await this.createVideoUrl(videoBuffer, mimeType);

        this.videos.set(fileName, {
          id: fileName,
          fileName,
          url,
          mimeType,
          name,
          extension,
        });
      }
    } catch (error) {
      console.error("Error loading videos:", error);
    }
  }

  getMimeType(extension) {
    const types = {
      mp4: "video/mp4",
      webm: "video/webm",
      ogg: "video/ogg",
      mov: "video/quicktime",
    };
    return types[extension] || null;
  }

  async createVideoUrl(buffer, mimeType) {
    const blob = new Blob([buffer], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  async addVideo() {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Videos",
            extensions: ["mp4", "webm", "ogg", "mov"],
          },
        ],
      });

      if (!selected) return;

      const videoBuffer = await readFile(selected);
      const originalFileName = selected.split("\\").pop();
      const parts = originalFileName.split(".");
      if (parts.length < 2) throw new Error("Invalid video file name");

      const extension = parts.pop().toLowerCase();
      // const originalName = parts.join(".");
      const mimeType = this.getMimeType(extension);

      if (!mimeType) throw new Error("Unsupported video format");

      // Use the original filename
      let fileName = originalFileName;

      // Handle conflicts
      let counter = 1;
      let baseName = fileName.replace(/\.[^/.]+$/, "");
      while (await exists(await join(this.videosDir, fileName))) {
        fileName = `${baseName} (${counter++}).${extension}`;
      }

      const videoPath = await join(this.videosDir, fileName);
      await writeFile(videoPath, videoBuffer);
      const url = await this.createVideoUrl(videoBuffer, mimeType);

      const videoData = {
        id: fileName,
        fileName,
        url,
        mimeType,
        name: fileName.split(".").slice(0, -1).join("."),
        extension,
        originalFileName,
      };

      this.videos.set(fileName, videoData);
      this.triggerCallbacks("added", videoData);

      return videoData;
    } catch (error) {
      console.error("Error adding video:", error);
      throw error;
    }
  }

  async deleteVideo(id) {
    try {
      const videoData = this.videos.get(id);
      if (!videoData) return;

      const videoPath = await join(this.videosDir, videoData.fileName);
      await remove(videoPath);
      URL.revokeObjectURL(videoData.url);

      this.videos.delete(id);
      this.triggerCallbacks("removed", videoData);

      return true;
    } catch (error) {
      console.error("Error deleting video:", error);
      throw error;
    }
  }

  getVideoList() {
    return Array.from(this.videos.values());
  }

  getVideoById(id) {
    return this.videos.get(id);
  }

  getVideoUrl(id) {
    const video = this.videos.get(id);
    return video ? video.url : null;
  }

  registerCallback(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  triggerCallbacks(eventType, videoData) {
    this.callbacks.forEach((callback) => callback(eventType, videoData));
  }

  async cleanup() {
    for (const [_, videoData] of this.videos) {
      URL.revokeObjectURL(videoData.url);
    }
    this.videos.clear();
  }
}

const videoManager = new VideoManager();
videoInstance = videoManager; // Fix the singleton check

export default videoManager;
