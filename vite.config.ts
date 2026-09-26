import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const baseSecurityHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

const devSecurityHeaders = {
  ...baseSecurityHeaders,
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: data: blob:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
};

const prodSecurityHeaders = {
  ...baseSecurityHeaders,
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' data: blob:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@application': path.resolve(__dirname, './src/application'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@features': path.resolve(__dirname, './src/features'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@runtime': path.resolve(__dirname, './src/runtime'),
      '@terminal': path.resolve(__dirname, './src/terminal'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@content': path.resolve(__dirname, './content'),
    },
  },
  server: {
    port: 5173,
    headers: devSecurityHeaders,
  },
  preview: {
    port: 4173,
    headers: prodSecurityHeaders,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/zustand')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@xterm')) {
            return 'vendor-xterm';
          }
          if (
            id.includes('node_modules/dexie') ||
            id.includes('node_modules/js-yaml') ||
            id.includes('node_modules/zod')
          ) {
            return 'vendor-data';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('/content/')) {
            return 'curriculum-content';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  worker: {
    format: 'es',
  },
});
