import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/smartcalender_self/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
  }
});
