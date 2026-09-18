import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: ['frontend/tests/**', 'node_modules/**', 'dist/**'],
  },
});
