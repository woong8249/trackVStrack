import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: 'test',
    reporters: 'verbose',
    coverage: {
      provider: 'v8',
    },
  },
});
