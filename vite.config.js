import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ws': {
        target: 'https://yearling-kakalina-turis-me-169e63c3.koyeb.app',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/ws/, '/ws') // mantenha se necessário
      },
    },
  },
});
