# 研之有物（langliu.github.io）

基于 **Astro** 搭建的个人博客 / 知识库项目，内容以 Web 开发为主（CSS / JavaScript / TypeScript / React 等），并通过 **GitHub Pages** 自动构建和部署。

## 技术栈

- [Astro](https://astro.build/)（站点与内容渲染）
- Markdown / MDX（文章编写）
- TypeScript
- Biome
- Tailwind CSS
- Pagefind（构建时生成的本地中文搜索索引）
- Google Tag Manager（统计入口；当前没有 Sentry 集成）

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
| `pnpm run test:smoke`        | 验证构建产物与 Pagefind 搜索索引（先 build） |
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
- 本地构建验证：`pnpm run build && pnpm run test:smoke`
- 浏览器预览：`pnpm run preview`

### 构建后冒烟测试

`test:smoke` 对应 `node scripts/smoke-test.mjs`，使用 Node 内置测试与断言，无新增依赖。
Node 版本遵循 `package.json` 的 `engines`，pnpm 版本遵循 `packageManager`。
先执行 `pnpm install --frozen-lockfile`，再运行构建与测试；不要使用过期的 `dist/`。

覆盖范围：

- 所有已发布文章的输出路由、模板文章标题与标题索引标记；草稿不生成文章页面。
- 长文章的目录显示阈值，以及桌面和移动目录的标题锚点。
- RSS 文章集合、标题和发布时间，sitemap 文章集合及输出文件；均排除草稿。
- 生成页面导航链接，以及文章正文指向 `/posts`、`/tags`、`/categories` 的站内链接。
- 真实 Pagefind 索引中的文章集合、标题、分类过滤，以及正文未出现的中文标题词检索。

边界与限制：

- 这是静态产物测试，不启动浏览器，不覆盖搜索 UI、客户端交互、视觉样式或线上部署。
- Pagefind 包的 Node API 仅用于构建索引；测试直接导入 `dist/pagefind/pagefind.js`，
  用仅允许读取该索引目录的 `fetch` 适配器运行真实搜索/WASM，不重新建立测试专用索引。
- 普通链接检查只验证目标输出文件，忽略 fragment 和 query；仅目录检查锚点，不检查外链可用性。
  开发文章正文中的 `/login`、`/about` 等非博客路由可能是教学示例，因此不检查；
  正文中的博客路由及正文之外的站内导航不享有此豁免。
- HTML/XML 提取针对当前 Astro 生成格式；frontmatter 读取只支持当前使用的单行字段，
  不是通用 HTML/XML/YAML 解析器。修改输出结构或字段格式时需同步更新测试。

## CI / 部署

- `.github/workflows/ci-check.yaml`：PR 与非 main 分支 push 时，安装锁定依赖，
  运行 Astro check、Biome lint / format:check、content:lint、build、test:smoke。
- `.github/workflows/deploy.yml`：main push 或手动触发，先完成同样的质量检查，
  再用 pnpm 构建并运行冒烟测试。只有测试成功才上传 `dist/` Pages artifact，
  然后使用 GitHub Pages Actions 部署；不使用 Astro 官方构建 Action。

## License

本仓库遵循 `LICENSE` 文件中的许可证说明。
