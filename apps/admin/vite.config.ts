import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: '0.0.0.0',
    allowedHosts: ['main.hookfolau.site', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: ['main.hookfolau.site', 'localhost', '127.0.0.1']
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});







