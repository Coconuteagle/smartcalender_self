import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: false,
  },
  build: {
    emptyOutDir: false,
  },
}));
