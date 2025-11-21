import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwind(), react()],
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
