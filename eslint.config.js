import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import sonarjs from 'eslint-plugin-sonarjs';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules', 'package-lock.json'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      react: reactPlugin,
      sonarjs: sonarjs,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...sonarjs.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      'sonarjs/prefer-read-only-props': 'warn',
      'sonarjs/no-dead-store': 'warn',
      'sonarjs/no-unused-vars': 'warn',
      'sonarjs/unused-import': 'warn',
      'sonarjs/no-redundant-assignments': 'warn',
      'sonarjs/pseudo-random': 'warn',
      'sonarjs/no-hardcoded-ip': 'warn',
      'sonarjs/prefer-regexp-exec': 'warn',
      'sonarjs/concise-regex': 'warn',
      'sonarjs/deprecation': 'warn',
      'sonarjs/no-ignored-exceptions': 'warn',
      'react/no-unescaped-entities': 'warn',
      'sonarjs/duplicates-in-character-class': 'warn',
      'sonarjs/slow-regex': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig,
);
