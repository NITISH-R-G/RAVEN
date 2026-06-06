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
      'sonarjs/prefer-read-only-props': 'off',
      'sonarjs/no-dead-store': 'off',
      'sonarjs/prefer-regexp-exec': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/cognitive-complexity': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/unused-import': 'off',
      'sonarjs/duplicates-in-character-class': 'off',
      'sonarjs/slow-regex': 'off',
      'sonarjs/no-redundant-assignments': 'off',
      'sonarjs/pseudo-random': 'off',
      'sonarjs/no-hardcoded-ip': 'off',
      'sonarjs/concise-regex': 'off',
      'sonarjs/deprecation': 'off',
      'sonarjs/no-ignored-exceptions': 'off',
      'sonarjs/no-unused-vars': 'off',
      ...reactPlugin.configs.recommended.rules,
      'sonarjs/prefer-read-only-props': 'off',
      'sonarjs/no-dead-store': 'off',
      'sonarjs/prefer-regexp-exec': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/cognitive-complexity': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/no-unescaped-entities': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/unused-import': 'off',
      'sonarjs/duplicates-in-character-class': 'off',
      'sonarjs/slow-regex': 'off',
      'sonarjs/no-redundant-assignments': 'off',
      'sonarjs/pseudo-random': 'off',
      'sonarjs/no-hardcoded-ip': 'off',
      'sonarjs/concise-regex': 'off',
      'sonarjs/deprecation': 'off',
      'sonarjs/no-ignored-exceptions': 'off',
      'sonarjs/no-unused-vars': 'off',
      ...sonarjs.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'sonarjs/cognitive-complexity': ['warn', 15],
      'sonarjs/no-nested-conditional': 'warn',
      'sonarjs/no-duplicate-string': 'warn',
      'sonarjs/no-identical-functions': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettierConfig,
);
