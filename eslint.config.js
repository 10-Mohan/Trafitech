import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'dev-dist', 'node_modules', 'coverage', 'server/node_modules']),

  // ─────────────────────────────────────────
  // Frontend: React / Browser / ESM files
  // ─────────────────────────────────────────
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js', 'postcss.config.js', 'tailwind.config.js'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },

  // ─────────────────────────────────────────
  // Backend: Node.js / CommonJS files
  // ─────────────────────────────────────────
  {
    files: ['server/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'no-debugger': 'error',
      // Allow console in server/backend code (needed for server logs)
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
    },
  },

  // ─────────────────────────────────────────
  // Tests: Declare test runner globals
  // ─────────────────────────────────────────
  {
    files: ['**/__tests__/**/*.{js,jsx}', '**/tests/**/*.js', 'src/__tests__/setup.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
        global: 'writable',
      },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
]);

