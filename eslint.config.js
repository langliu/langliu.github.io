import eslintPluginAstro from 'eslint-plugin-astro';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // Apply to all files
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  // Astro files configuration
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: eslintPluginAstro.parser,
      parserOptions: {
        parser: typescriptParser,
        extraFileExtensions: ['.astro'],
      },
    },
    rules: {
      // Add any custom rules for Astro files here
    },
  },
  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
    },
    rules: {
      // Add any custom rules for TypeScript files here
    },
  },
];
