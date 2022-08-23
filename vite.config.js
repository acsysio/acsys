import dotenv from 'dotenv';
dotenv.config();

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const { PORT = 8080 } = process.env;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    origin: `http://localhost:3000`,
    proxy: {
      '/api': {
        target: `http://localhost:${PORT}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
