# 研之有物（langliu.github.io）

基于 **Astro** 搭建的个人博客 / 知识库项目，内容以 Web 开发为主（CSS / JavaScript / TypeScript / React 等），并通过 **GitHub Pages** 自动构建和部署。

## 技术栈

- [Astro](https://astro.build/)（站点与内容渲染）
- Markdown / MDX（文章编写）
- TypeScript
- ESLint + Prettier
- Tailwind CSS
- Sentry（可选，用于错误监控与构建相关集成）

## 内容与目录结构

- `posts/`：文章源文件（`.md` / `.mdx`）
- `src/content.config.ts`：内容集合（Collection）与 frontmatter schema 校验
- `src/pages/`：页面路由
- `src/components/`：通用组件
- `public/`：静态资源
- `.github/workflows/`：CI 检查与 GitHub Pages 部署流水线（已切换为 Bun）

### 文章 Frontmatter 约定（posts）

文章文件应包含 Frontmatter，并满足 `src/content.config.ts` 中的 schema 约束（如 `title`、`publishedAt`、`description`、`slug`、`category` 等）。

分类 `category` 目前支持：

- `CSS`
- `Vue`
- `React`
- `其他`
- `HTML`
- `JavaScript`
- `TypeScript`

> 说明：实际字段与默认值以 `src/content.config.ts` 为准；新增字段时也需要同步更新 schema。

## 开发与构建（Bun）

本项目包管理已从 npm 迁移至 **Bun**，使用 `bun.lock` 作为锁文件。

> 所有命令均在项目根目录执行。

| 命令 | 作用 |
|---|---|
| `bun install` | 安装依赖 |
| `bun run dev` | 启动本地开发服务器（默认 `localhost:4321`） |
| `bun run start` | 启动开发服务器（等同 Astro dev） |
| `bun run build` | 构建产物到 `./dist/` |
| `bun run preview` | 本地预览构建产物 |
| `bun run check` | Astro 类型/内容检查 |
| `bun run astro -- --help` | 查看 Astro CLI 帮助 |

### 常见操作

- 新增文章：在 `posts/` 下添加 `.md`/`.mdx` 文件，并补充 Frontmatter
- 本地检查：`bun run check`
- 本地构建验证：`bun run build && bun run preview`

## CI / 部署

- `/.github/workflows/ci-check.yaml`：在 push / PR 时运行 `bun install --frozen-lockfile` + `bun run check`
- `/.github/workflows/deploy.yml`：使用 Astro 官方 GitHub Action 构建站点并部署到 GitHub Pages（已配置为使用 Bun）

## License

本仓库遵循 `LICENSE` 文件中的许可证说明。
