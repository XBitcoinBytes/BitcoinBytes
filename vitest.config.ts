import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['server/**/__tests__/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['server/comparison/**/*.ts'],
      exclude: ['server/comparison/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@shared': new URL('shared', import.meta.url).pathname,
    },
  },
});
