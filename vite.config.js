// vite.config.js ichida namuna:
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // 🚀 Yangilanishlar avtomatik o'tishi uchun juda muhim!
      manifest: {
        // manifest sozlamalari...
      }
    })
  ]
});
