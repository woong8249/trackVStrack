import { defineConfig, loadEnv, Plugin } from 'vite';
import eslint from 'vite-plugin-eslint';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const eslint4vitePath = join(__dirname, 'eslint4vite.js');
const plugins = [
  react(),
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
  return {
    plugins,
    resolve: {
      alias: {
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@typings': path.resolve(__dirname, 'src/typings'),
      },
    },
  };
});
