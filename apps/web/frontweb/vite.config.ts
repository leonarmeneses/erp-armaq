import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    open: '/login', // Abrir siempre la página de login
    proxy: {
      '/api': 'http://localhost:3010'
    }
  }
});
