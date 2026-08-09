# Agent 使用指南 - langliu.github.io

## 项目概况

- Astro 中文个人博客，静态部署到 GitHub Pages
- 包管理器：pnpm 11.18.0；Node：24（见 `.nvmrc`）
- 文章目录：`/posts/`，格式为 `.md` 或 `.mdx`
- 用户界面和文章内容使用中文，代码使用英文
- 不主动执行 `git commit`

## 编码规范

### 导入与格式

- `@/` 映射到 `src/`；Astro 内置模块使用 `astro:` 前缀
- 导入顺序：Astro 内置 → 第三方库 → `@/` 本地模块 → 相对路径
- Biome 规范：无分号、单引号、2 空格缩进、打印宽度 100
- 注释使用简洁中文，代码使用英文命名

### TypeScript 与命名

- 启用严格模式；优先使用 `type`，不用 `interface`
- 组件 Props 使用显式类型；类型集中放在 `src/utils/types/`
- 组件使用 PascalCase，工具函数使用 camelCase，常量使用 UPPER_SNAKE_CASE

### 组件与样式

- 优先使用 Astro 服务端渲染和 `astro:assets` 的 `Image`
- 条件类名使用 `class:list`，交互元素补充 `aria-label`
- 使用 Tailwind CSS v4；复杂样式放在 `src/styles/`
- 可恢复问题使用 `console.warn()`，意外错误使用 `console.error()`；外部操作使用 `try/catch` 并返回合理默认值

### Markdown 链接

- 文章中的第三方链接使用 Markdown 支持的内嵌 `<a>` 标签，并设置 `target='_blank' rel='noopener noreferrer'`
- 站内链接保持默认当前页面打开

## 文章内容

Frontmatter 必填：`title`、`publishedAt`、`description`、`isPublish`、`slug`、`category`。

可选：`updatedAt`、`cover`、`tags`。已发布文章必须设置至少一个 `tags`。

分类仅限：`CSS`、`Vue`、`React`、`其他`、`HTML`、`JavaScript`、`TypeScript`。

## CI、Hooks 与提交

- PR/push 运行 `pnpm run check`；推送 `main` 后部署 GitHub Pages
- 使用 `pnpm install --frozen-lockfile`；Lefthook 在提交前运行 Biome，推送前运行检查和 Lint
- 提交格式：`<type>: <subject>`；主题使用祈使句、不超过 50 字符、不加句号，正文每行不超过 72 字符
- 常用 type：`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`chore`、`ci`、`revert`
