import { defineConfig, loadEnv, type Plugin } from 'vite';
import eslint from 'vite-plugin-eslint';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslint4vitePath = join(__dirname, 'eslint4vite.js');
const plugins = [
  { // default settings on build (i.e. fail on error)
    ...eslint({ eslintPath: eslint4vitePath }),
    apply: 'build',
  } as Plugin,
  { // do not fail on serve (i.e. local development)
    ...eslint({
      eslintPath: eslint4vitePath,
      failOnWarning: false,
      failOnError: false,
      emitError: true,
      emitWarning: true,
    }),
    apply: 'serve',
    enforce: 'post',
  } as Plugin,
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins,
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
