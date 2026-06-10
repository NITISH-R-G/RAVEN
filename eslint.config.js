import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  sonarjs.configs.recommended,
  prettierConfig,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      react: reactPlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
      "sonarjs/cognitive-complexity": "off",
      "sonarjs/no-duplicate-string": "off",
      "sonarjs/no-redundant-assignments": "off",
      "sonarjs/no-unused-vars": "off",
      "sonarjs/no-dead-store": "off",
      "sonarjs/prefer-regexp-exec": "off",
      "sonarjs/prefer-read-only-props": "off",
      "sonarjs/no-nested-conditional": "off",
      "sonarjs/no-ignored-exceptions": "off",
      "sonarjs/x-powered-by": "off",
      "sonarjs/pseudo-random": "off",
      "sonarjs/no-hardcoded-ip": "off",
      "sonarjs/deprecation": "off",
      "sonarjs/concise-regex": "off",
      "sonarjs/slow-regex": "off",
      "sonarjs/duplicates-in-character-class": "off",
      "react/no-unescaped-entities": "off",
      "sonarjs/unused-import": "off"
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-console": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "sonarjs/pseudo-random": "off",
      "sonarjs/no-os-command-from-path": "off",
      "sonarjs/no-ignored-exceptions": "off"
    }
  }
);
