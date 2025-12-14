import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/smartcalender_self/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
