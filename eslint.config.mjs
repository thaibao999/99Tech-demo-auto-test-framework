import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import markdown from 'eslint-plugin-markdown'
import playwright from 'eslint-plugin-playwright'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['node_modules/**', 'playwright-report/**', 'test-results/**', 'package-lock.json'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // TypeScript sources (e2e-tests, playwright.config.ts)
  {
    files: ['**/*.ts'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      // TypeScript already checks globals (Node, DOM) and unresolved names; ESLint's core rules do not know them.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      // Playwright fixtures use `async ({}, use) => ...` for unused fixture params.
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'import/no-duplicates': 'error',
      // TypeScript already resolves imports; the import resolver does not understand .ts paths.
      'import/no-unresolved': 'off',
    },
  },

  // Playwright specs
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e-tests/tests/**/*.spec.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Page-object assertion helpers (e.g. homePage.expectLoggedIn) count as assertions.
      'playwright/expect-expect': ['warn', { assertFunctionPatterns: ['^expect', '^verify'] }],
    },
  },

  // k6 load scripts (plain JS; k6 runtime modules are not resolvable by Node)
  {
    files: ['load-tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        __ENV: 'readonly',
        open: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'import/no-unresolved': 'off',
    },
  },

  // Markdown: lint fenced ```ts / ```js code blocks only
  {
    files: ['**/*.md'],
    plugins: { markdown },
    processor: 'markdown/markdown',
  },

  // Prettier: formatting is enforced via ESLint and uses .prettierrc
  prettierRecommended,
)
