import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    test: {
      env,
      root: 'test',
      reporters: 'verbose',
      watch: false,
      coverage: {
        provider: 'v8',
      },
    },
  };
});
