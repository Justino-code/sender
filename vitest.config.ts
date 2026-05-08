import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'], // Adicionar setup
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});