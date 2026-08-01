# Agent 使用指南 - langliu.github.io

## 项目概述

- **项目类型**: Astro 5 个人博客（中文内容）
- **包管理器**: pnpm 11.18.0
- **部署平台**: GitHub Pages

## 构建命令

```bash
# 开发环境
pnpm run dev              # 启动开发服务器（带 host 绑定）
pnpm run start            # 等同于 astro dev

# 生产环境
pnpm run build            # 构建静态站点到 ./dist/
pnpm run preview          # 本地预览构建产物

# 类型检查
pnpm run check            # Astro 类型/内容校验（CI 中使用）

# 代码检查与格式化
pnpm run lint             # 使用 Biome 进行代码检查
pnpm run lint:fix        # 使用 Biome 自动修复可修复问题
pnpm run format:check    # 仅检查代码格式化
pnpm run format          # 仅执行代码格式化
pnpm run content:lint    # 校验 posts frontmatter
```

**注意**: 本项目未配置测试运行器。

## 代码风格指南

### 导入规范

- **使用路径别名**: `@/` 映射到 `src/`

  ```typescript
  // 推荐
  import Header from '@/components/Header.astro'
  import { formatDate } from '@/utils/formatDate'

  // 尽量避免相对路径
  import Header from '../components/Header.astro' // 仅在同一目录下使用
  ```

- **Astro 导入**: 使用 `astro:` 前缀导入内置模块
  ```typescript
  import { getCollection } from 'astro:content'
  import { Image } from 'astro:assets'
  ```
- **导入顺序**: Astro 内置 → 第三方库 → 别名路径本地模块 → 相对路径本地模块

### 格式化 (Biome)

- **不使用分号**
- **单引号**（JSX 也使用单引号）
- **2 空格缩进**
- **打印宽度**: 100
- 提交前运行 `pnpm run format`

### TypeScript

- **启用严格模式** - 遵循所有严格类型规则
- **显式类型声明** 用于组件 props：
  ```typescript
  type Props = {
    title: string
    publishedAt: Date
    description: string
  }
  const { title, publishedAt, description } = Astro.props
  ```
- 类型定义放在 `src/utils/types/`
- 统一使用 `type` 而非 `interface`

### 命名规范

- **组件**: PascalCase (`PostCard.astro`, `SEOTags.astro`)
- **工具函数**: camelCase (`formatDate.ts`)
- **类型**: PascalCase (`HeadTags`, `Presentation`)
- **常量**: UPPER_SNAKE_CASE（在数据文件中）
- **文件**: kebab-case 或描述性名称（可包含中文）

### 组件编写规范

- 使用 Astro 内置的 `Image` 组件进行图片优化
- 优先使用服务端渲染（Astro 默认）
- 使用 `class:list` 进行条件类名处理
- 在交互元素上添加 `aria-label`

### 错误处理

- 优雅地返回默认值
- 使用 `console.warn()` 处理可恢复的问题
- 使用 `console.error()` 处理意外错误
- 将外部操作包装在 try-catch 中

```typescript
export default function formatDate(date: Date): string {
  if (!date || !(date instanceof Date)) {
    console.warn('Invalid date:', date)
    return '日期无效'
  }
  try {
    return new Intl.DateTimeFormat('zh-CN').format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return '日期无效'
  }
}
```

### 内容 Schema

文章使用 `src/content.config.ts` 中的 Zod 进行校验：

- 必需字段: `title`, `publishedAt`, `description`, `isPublish`, `slug`, `category`
- 可选字段: `tags`, `updatedAt`, `cover`
- 分类: `'CSS' | 'Vue' | 'React' | '其他' | 'HTML' | 'JavaScript' | 'TypeScript'`

### 样式规范

- **Tailwind CSS v4** 用于工具类
- 复杂样式放在 `src/styles/` 中的自定义 CSS
- 使用 Tailwind 中性色板的语义化颜色名称

### 注释规范

- 使用 **中文** 编写注释，与项目语言保持一致
- 保持注释简洁有意义

## Biome 配置

本项目使用 Biome 统一处理代码检查与格式化：

```bash
# 检查代码
pnpm run lint

# 自动修复
pnpm run lint:fix

# 仅格式化
pnpm run format
```

Biome 配置文件位于 `biome.json`。

## CI/CD 说明

- CI 在每次 PR/push 时运行 `pnpm run check`
- 推送到 `main` 分支时自动部署到 GitHub Pages
- 使用 pnpm 并锁定版本: `pnpm install --frozen-lockfile`
- Node 版本: 24（见 `.nvmrc`）

## Git Commit 规范

使用以下格式编写提交信息：

```
<type>: <subject>

<body>
```

### 提交类型 (type)

- **feat**: 新功能
- **fix**: 修复 Bug
- **docs**: 文档相关
- **style**: 代码格式调整（不影响功能的空格、格式化、分号等）
- **refactor**: 代码重构（既不是修复 Bug 也不是添加新功能）
- **perf**: 性能优化
- **test**: 添加或修改测试
- **chore**: 构建过程或辅助工具的变动
- **ci**: CI/CD 配置修改
- **revert**: 回滚提交

### 提交主题 (subject)

- 使用中文或英文描述，保持一致
- 不超过 50 个字符
- 首字母小写
- 不使用句号结尾
- 使用祈使句语气（如：添加、修复、更新）

### 提交正文 (body)

- 可选，用于详细描述变更内容
- 每行不超过 72 个字符
- 说明 **为什么** 做此变更，而非 **做了什么**

### 示例

```
feat: 添加文章标签功能

- 在文章 Frontmatter 中添加 tags 字段
- 在文章详情页展示标签列表
- 添加标签筛选页面

fix: 修复移动端导航栏样式问题

docs: 更新 README 中的部署说明

style: 格式化代码，修复 Biome 警告

refactor: 优化日期格式化工具函数

chore: 更新依赖版本
```

## Git Hooks (Lefthook)

- 使用 `lefthook` 管理 hooks（配置见 `lefthook.yml`）
- `pre-commit`：对暂存的 JS/TS/JSON/CSS/Astro 文件运行 Biome 并写回
- `pre-push`：运行 `pnpm run check` 与 `pnpm run lint`
- 安装依赖后通过 `prepare` 自动执行 `lefthook install`
- 本地个人覆盖可写 `lefthook-local.yml`（已 gitignore）

## 重要提醒

- 推送前务必运行 `pnpm run check`
- 提交前使用 Biome 格式化代码（pre-commit 会自动处理常见文件）
- 保持工具函数纯净且可测试
- **不要主动提交（git commit）** - 除非用户明确要求
- 用户界面内容使用中文，代码使用英文
- 博客文章放在 `/posts/` 目录下，格式为 `.md` 或 `.mdx`
