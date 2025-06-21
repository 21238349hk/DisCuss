import js from '@eslint/js';
import globals from 'globals';

// Frontend plugins
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Backend (functions) plugins
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist/'] },

  // Global recommended rules
  js.configs.recommended,

  // --- Frontend (React) Specific Rules ---
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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

  // --- Backend (Cloud Functions) Specific Rules ---
  {
    files: ['functions/src/**/*.ts'],
    plugins: {
      '@typescript-eslint': ts,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: 'functions/tsconfig.json', // functionsディレクトリ内のtsconfigを指定
      },
      globals: {
        ...globals.node, // Node.js環境のグローバル変数を有効化
      },
    },
    rules: {
      ...ts.configs['recommended'].rules,
      'quotes': ['error', 'double'],
      'no-undef': 'off', // CommonJSの`require`等でエラーが出ないように
    },
  },
];