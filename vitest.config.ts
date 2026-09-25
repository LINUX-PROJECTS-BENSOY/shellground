import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

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
      '@content': path.resolve(__dirname, './content'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', '**/*.d.ts', 'tests/fixtures/'],
    },
  },
});
