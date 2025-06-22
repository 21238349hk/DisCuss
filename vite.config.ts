import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      // Gemini APIのプロキシ設定（必要に応じて）
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, ''),
      },
      // Zoom OAuth APIのプロキシ設定
      '/api/zoom/oauth': {
        target: 'https://zoom.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zoom\/oauth/, '/oauth'),
      },
      // Zoom APIのプロキシ設定
      '/api/zoom/v2': {
        target: 'https://api.zoom.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zoom\/v2/, '/v2'),
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
