import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    topLevelAwait(),
    wasm(),
    tailwindcss(),
  ],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target:
      'chrome105',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {

            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
  define: { global: 'window' }
})
