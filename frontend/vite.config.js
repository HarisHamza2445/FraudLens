import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true
      }
    }
  },
  define: {
    // Makes VITE_API_URL available as import.meta.env.VITE_API_URL
    // In dev it's empty (proxy handles it). In production Render sets it.
    'import.meta.env.VITE_API_URL': JSON.stringify(
      mode === 'production' ? (process.env.VITE_API_URL || '') : ''
    )
  }
}));
