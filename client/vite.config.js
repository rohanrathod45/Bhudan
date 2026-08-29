import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Server proxy forwards API calls to the Express backend during development
// so the client can use relative URLs (no CORS friction).
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces (IPv4 + IPv6). Node 17+ resolves localhost to
    // ::1 (IPv6) first, which left 127.0.0.1 unreachable and broke browsers
    // (e.g. Edge) that connect over IPv4 loopback.
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
});