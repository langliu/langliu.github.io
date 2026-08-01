# 研之有物（langliu.github.io）

基于 **Astro** 搭建的个人博客 / 知识库项目，内容以 Web 开发为主（CSS / JavaScript / TypeScript / React 等），并通过 **GitHub Pages** 自动构建和部署。

## 技术栈

- [Astro](https://astro.build/)（站点与内容渲染）
- Markdown / MDX（文章编写）
- TypeScript
- Biome
- Tailwind CSS
- Sentry（可选，用于错误监控与构建相关集成）

## 内容与目录结构

- `posts/`：文章源文件（`.md` / `.mdx`）
- `src/content.config.ts`：内容集合（Collection）与 frontmatter schema 校验
- `src/pages/`：页面路由
- `src/components/`：通用组件
- `public/`：静态资源
- `.github/workflows/`：CI 检查与 GitHub Pages 部署流水线（已切换为 pnpm）

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

## 开发与构建（pnpm）

本项目使用 **pnpm** 管理依赖，使用 `pnpm-lock.yaml` 作为锁文件。

> 所有命令均在项目根目录执行。

| 命令                         | 作用                                        |
| ---------------------------- | ------------------------------------------- |
| `pnpm install`               | 安装依赖                                    |
| `pnpm run dev`               | 启动本地开发服务器（默认 `localhost:4321`） |
| `pnpm run start`             | 启动开发服务器（等同 Astro dev）            |
| `pnpm run build`             | 构建产物到 `./dist/`                        |
| `pnpm run preview`           | 本地预览构建产物                            |
| `pnpm run check`             | Astro 类型/内容检查                         |
| `pnpm run lint`              | 使用 Biome 进行代码检查                     |
| `pnpm run lint:fix`          | 使用 Biome 自动修复可修复问题               |
| `pnpm run format:check`      | 仅检查格式                                  |
| `pnpm run format`            | 仅执行格式化                                |
| `pnpm run astro -- --help`   | 查看 Astro CLI 帮助                         |

### 常见操作

- 新增文章：在 `posts/` 下添加 `.md`/`.mdx` 文件，并补充 Frontmatter
- 本地检查：`pnpm run check`
- 本地构建验证：`pnpm run build && pnpm run preview`

## CI / 部署

- `/.github/workflows/ci-check.yaml`：在 push / PR 时运行 `pnpm install --frozen-lockfile` + `pnpm run check` + `pnpm run lint` + `pnpm run build`
- `/.github/workflows/deploy.yml`：使用 Astro 官方 GitHub Action 构建站点并部署到 GitHub Pages（已配置为使用 pnpm）

## License

本仓库遵循 `LICENSE` 文件中的许可证说明。
