# 研之有物

Astro 中文技术博客，使用 EmDash 1.2 管理文章和媒体。保留现有页面设计、文章路径、目录、代码复制、分类、标签和 RSS；文章从数据库实时读取，后台发布后无需重新构建。

本地使用 Node.js + SQLite + 文件存储，生产使用 Cloudflare Workers + D1 + R2。GitHub Pages 无法运行 EmDash 后台和数据库服务，公开地址需要使用 Workers 地址或自定义域名。

## 本地开发

Node.js 版本满足 `package.json` 的 `engines`，pnpm 版本遵循 `packageManager`。

```sh
pnpm install --frozen-lockfile
pnpm run content:migrate
pnpm run cf:types
pnpm run dev
```

访问 `http://localhost:4321`，后台为 `http://localhost:4321/_emdash/admin`。首次进入后台按向导建立管理员及通行密钥。WebAuthn 的 RP ID 要求域名，不能用 `127.0.0.1` 注册通行密钥；开发环境的 IP 后台入口会自动跳转至 `localhost`。开发服务默认只监听 localhost，开发登录绕过接口在所有环境中禁用。开发时忽略正式 `SITE_URL`、`EMDASH_SITE_URL` 和 `EMDASH_ALLOWED_ORIGINS`，确保本地通行密钥使用 localhost。

导入包含 37 篇已发布文章、2 篇草稿、23 张图片。Markdown / MDX 转成后台可编辑的 Portable Text，保留代码语言、嵌套列表、表格、图片、外链和 iframe；提示块转为引用块。源文件保留在 `posts/` 和 `src/assets/posts/`，作为迁移存档。以后在后台编辑和发布文章，源文件不会自动同步数据库。

重复运行迁移按 slug 跳过已存在文章，媒体按内容哈希去重，不覆盖后台修改。本地迁移会修复与旧导入正文完全一致的列表结构；已经编辑过的正文保持不变。删除 `.emdash/` 会丢失本地数据库、媒体和账号，不能用它作为日常重置步骤。

本地数据位于 `.emdash/data.db` 和 `.emdash/uploads/`，均不提交 Git。需要备份两者。`seed/seed.json` 只包含站点设置和文章字段定义，不含文章或凭据。

## 编辑文章

在 EmDash 的文章集合中管理标题、摘要、发布日期、更新日期、分类、标签、封面和正文。分类保持原有七类。标签多选选项包含迁移时的全部标签；新增标签时，在后台集合字段设置中扩展标签选项。已发布文章应至少选择一个标签。

前台只读取已发布文章，草稿不出现在列表、搜索、RSS 和 sitemap 中。搜索通过实时内容匹配，支持两字中文查询，分类和标签可以组合筛选。文章量增大后可另行接入专用搜索服务。

EmDash 的内部默认内容语言使用 `en`，前台仍为 `zh-CN`；该代码是单语言数据库查询约定，不影响中文标题、正文或标签。

## 检查与构建

```sh
pnpm run check
pnpm run lint
pnpm run format:check
pnpm run content:lint
pnpm run test:migration
pnpm run test:dev
pnpm run build
pnpm run test:smoke
pnpm run build:cloudflare
pnpm exec wrangler deploy --dry-run
```

`test:migration` 检查所有源文章的转换、代码保真、列表、图片和表格；`test:dev` 在临时目录验证开发绕过禁用与本地通行密钥域名；`test:smoke` 启动 Node 生产服务，验证全部文章路径、日期、封面、目录、搜索、RSS、sitemap、草稿隔离和生产认证。服务测试复制本地数据库到临时目录，不修改开发数据。

`pnpm run build` 生成 Node 生产服务，启动命令为 `HOST=127.0.0.1 PORT=4322 node dist/server/entry.mjs`。构建目录只保留最后一种部署目标；测试 Node 服务前需重新运行 `build`。

## Cloudflare 部署

配置在 `wrangler.jsonc`：Worker `langliu-blog`、D1 `langliu-blog`、R2 `langliu-blog-media`，一分钟一次的定时任务负责 EmDash 调度。未启用沙箱插件运行器。

首次部署先使用 Wrangler 登录，并确保账号已开通 R2。Wrangler 可按绑定配置创建缺失资源；如使用现有资源，在配置中填写对应 D1 ID，并确认 R2 桶名。

当前 Workers 产物约 19.6 MiB（未压缩），低于 [官方 64 MiB 限制](https://developers.cloudflare.com/workers/platform/limits/#worker-size)。本地 D1 / R2 已验证全部文章路由及媒体响应，线上 CPU 用量仍以部署后的观测为准。

```sh
pnpm exec wrangler login
pnpm run deploy
```

部署会提供 `https://langliu-blog.<账号子域>.workers.dev`。如需固定 canonical、RSS 和 sitemap 域名，将 `.env.example` 复制为 `.env` 并填写实际 `SITE_URL` 后重新构建；未设置时使用请求来源。后台安全地址需直接使用最终 HTTPS 域名，通行密钥与域名绑定。

首次部署后，由站点所有者立即完成 `/_emdash/admin` 初始化和通行密钥注册，再进行内容导入。生产数据库独立于本地 SQLite，部署代码不会上传本地账号或文章。首次后台运行会初始化数据库和种子集合字段。

在后台创建具有内容读写、发布和媒体上传权限的个人访问令牌，并通过环境变量提供给导入脚本。不要将令牌写入命令行参数或提交到仓库。例如在终端使用隐藏输入：

```sh
read -s EMDASH_TOKEN
export EMDASH_TOKEN
pnpm run content:migrate --remote https://你的站点域名
unset EMDASH_TOKEN
```

远程脚本使用认证 API 上传媒体并创建文章，保留原 slug、发布日期和草稿状态。按 slug 跳过现有文章，发布中断后可重跑；`.emdash/remote-import-*.json` 记录本次新建但未发布的文章，不包含令牌。重跑使用同一迁移工作目录，避免丢失恢复记录。

线上内容以 D1 和 R2 为准；部署和 CI 不重新导入生产内容，不会用存档覆盖后台修改。上线后分别备份 D1 与 R2。旧 GitHub Pages 地址不能直接切换为 Worker 域名，应在确认新站和管理员登录正常后，再处理旧站跳转或域名切换。

## CI 与持续部署

PR 和各分支推送运行完整迁移、类型、格式、内容、转换、Node 生产冒烟测试及 Workers 构建预检。

生产部署改为手动触发 `.github/workflows/deploy.yml`。在 `cloudflare-production` 环境配置 `CLOUDFLARE_API_TOKEN`、`CLOUDFLARE_ACCOUNT_ID` 两个 Secret，以及可选 `SITE_URL` Variable。令牌需具备 Workers 部署和对应 D1、R2、KV 等绑定资源权限。先完成首次资源及管理员初始化，再使用该工作流更新代码。

## License

见 `LICENSE`。
