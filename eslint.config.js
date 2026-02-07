import eslintPluginAstro from 'eslint-plugin-astro'
import typescriptParser from '@typescript-eslint/parser'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

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
  // Tailwind CSS configuration
  {
    files: ['**/*.{js,jsx,ts,tsx,astro}'],
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    settings: {
      'better-tailwindcss': {
        // Tailwind CSS v4 入口点
        entryPoint: './src/styles/global.css',
        // 允许检测组件类
        detectComponentClasses: true,
        // 忽略自定义类名
        ignoredKeys: [
          'bg-dot',
          'post',
          'text-md',
          'content-of-tables',
          'nav',
          'nav-link',
          'depth-',
        ],
      },
    },
    rules: {
      ...betterTailwindcss.configs.recommended.rules,
      // 禁用行换行规则，避免与 Prettier 冲突
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      // 禁用类名顺序规则，与 Prettier 插件重复
      'better-tailwindcss/enforce-consistent-class-order': 'off',
      // 配置未知类名检查，忽略自定义类
      'better-tailwindcss/no-unknown-classes': [
        'error',
        {
          ignore: ['bg-dot', 'post', 'text-md', 'content-of-tables', 'nav', 'nav-link', 'depth-'],
        },
      ],
    },
  },
]
