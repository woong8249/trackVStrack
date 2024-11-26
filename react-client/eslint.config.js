import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

const filename = fileURLToPath(import.meta.url);
const dirName = dirname(filename);
const compat = new FlatCompat();
const configProvidedByVite = tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);

const customConfig = [
  ...compat.extends(join(dirName, 'importless-airbnb-base.cjs')),
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      parserOptions: {
      // Eslint doesn't supply ecmaVersion in `parser.js` `context.parserOptions`
      // This is required to avoid ecmaVersion < 2015 error or 'import' / 'export' error
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      react,
    },
    rules: {
      'no-shadow': 'off',
      'max-len': ['error', { code: 200 }], // 줄 길이를 최대 200자로 설정
      'no-underscore-dangle': ['error', { allow: ['__filename', '__dirname'] }],
      // 여러 줄에 걸쳐 JSX 표현식을 사용할 때, 괄호로 감싸도록 강제합니다.
      // 'parens-new-line': 표현식을 괄호로 감싸고, 각 줄에 개행을 넣습니다.
      'react/jsx-wrap-multilines': ['error', {
        declaration: 'parens-new-line', // 변수 선언 시, JSX는 괄호로 감싸고 줄바꿈
        assignment: 'parens-new-line', // JSX를 변수에 할당할 때 괄호로 감싸고 줄바꿈
        return: 'parens-new-line', // return 구문에 JSX가 포함될 때 괄호로 감싸고 줄바꿈
        arrow: 'parens-new-line', // 화살표 함수에서 JSX가 반환될 때 괄호로 감싸고 줄바꿈
        condition: 'parens-new-line', // 조건부 JSX 표현식에 괄호 및 줄바꿈 적용
        logical: 'parens-new-line', // 논리 연산자 (&&, || 등)와 함께 사용된 JSX에 줄바꿈
        prop: 'parens-new-line', // JSX props에 자식 JSX 요소가 있을 때 줄바꿈
      }],
      // JSX 태그의 첫 번째 prop이 여러 줄에 걸친 경우, 새 줄에서 시작하도록 강제합니다.
      'react/jsx-first-prop-new-line': ['error', 'multiline'],
      // JSX 태그가 여러 props를 가질 때, prop마다 새 줄에 위치시키도록 강제합니다.
      // 단, props가 여러 줄에 걸쳐 있을 때만 적용됩니다.
      'react/jsx-max-props-per-line': ['error', { when: 'multiline' }],
      // JSX에서 태그의 닫힘 전에, self-closing 태그의 경우에는 항상 공백을 추가합니다.
      'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
      // JSX 태그 사이에 불필요한 줄바꿈을 방지합니다.
      // allowMultilines: 여러 줄에 걸친 JSX 표현식에서는 줄바꿈을 허용합니다.
      'react/jsx-newline': ['error', { prevent: true, allowMultilines: true }],
      // JSX의 들여쓰기를 강제합니다. (여기서는 2칸 들여쓰기를 적용)
      'react/jsx-indent': ['error', 2],
      // 한 줄에 하나의 JSX 표현식만 허용하도록 강제합니다.
      // 단, 단일 자식을 가진 경우는 허용됩니다.
      'react/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],
      // 'no-underscore-dangle': ['off'], // custom
    },
  },
];

const config = [...configProvidedByVite, ...customConfig];

export default config;
