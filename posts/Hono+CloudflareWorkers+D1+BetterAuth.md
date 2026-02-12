---
title: Hono + Cloudflare Workers + D1 + BetterAuth 实现后端开发模板
publishedAt: 2025-08-20
category: 'TypeScript'
tags:
  - Hono
  - TypeScript
  - Cloudflare Workers
  - D1
  - BetterAuth
slug: hono-with-cloudflare-workers-d1-better-auth
isPublish: false
description: 这是一个使用 Hono + Cloudflare Workers + D1 + BetterAuth 实现的后端开发模板。
---

## 项目介绍

在现代 Web 开发中，构建一个高性能、可扩展的后端服务变得越来越重要。本文将介绍如何使用以下技术栈构建一个完整的后端开发模板：

- **Hono**：轻量级、高性能的 Web 框架
- **Cloudflare Workers**：边缘计算平台，提供全球分布式部署
- **D1**：Cloudflare 的 SQLite 数据库服务
- **BetterAuth**：现代化的身份验证库
- **Drizzle**：Drizzle ORM

这个技术栈的优势在于：

- 🚀 **高性能**：边缘计算带来的低延迟
- 💰 **成本效益**：Cloudflare 的免费额度非常慷慨
- 🔒 **安全性**：内置的安全特性和现代认证方案
- 🌍 **全球部署**：自动的全球 CDN 分发

## 技术栈介绍

### Hono

Hono 是一个轻量级、快速的 Web 框架，专为边缘运行时设计。它支持多种运行时环境，包括 Cloudflare Workers、Deno、Bun 等。

**主要特点：**

- 极小的包体积（~13kB）
- 类型安全的路由系统
- 内置中间件支持
- 优秀的 TypeScript 支持

### Cloudflare Workers

Cloudflare Workers 是一个无服务器计算平台，允许您在 Cloudflare 的全球网络边缘运行 JavaScript 代码。

**主要优势：**

- 全球 200+ 数据中心
- 冷启动时间极短（<1ms）
- 按请求付费模式
- 与 Cloudflare 生态系统深度集成

### D1 数据库

D1 是 Cloudflare 提供的分布式 SQLite 数据库，专为边缘计算优化。

**核心特性：**

- 基于 SQLite，熟悉的 SQL 语法
- 全球复制和同步
- 与 Workers 无缝集成
- 支持事务和复杂查询

### BetterAuth

BetterAuth 是一个现代化的身份验证库，提供了完整的认证解决方案。

**主要功能：**

- 多种认证方式（邮箱/密码、OAuth、魔法链接等）
- 会话管理
- 角色和权限控制
- TypeScript 优先设计

### Drizzle ORM

Drizzle 是一个轻量级、类型安全的 TypeScript ORM，专为现代应用程序设计。

**核心优势：**

- **类型安全**：完全的 TypeScript 支持，编译时类型检查
- **性能优异**：零运行时开销，生成高效的 SQL 查询
- **开发体验**：直观的 API 设计和优秀的 IDE 支持
- **灵活性**：支持原生 SQL 查询和复杂的关系查询
- **多数据库支持**：PostgreSQL、MySQL、SQLite 等
- **迁移系统**：内置的数据库迁移工具

## 项目结构

```bash
├── src/
│   ├── index.tsx            # 应用入口文件
│   ├── lib/
│   │   ├── auth.ts          # BetterAuth 配置
│   │   ├── database.ts      # D1 数据库配置
│   │   ├── drizzle.ts       # Drizzle ORM 配置
│   │   └── utils.ts         # 工具函数
│   ├── routes/
│   │   ├── auth.ts          # 认证相关路由
│   │   ├── users.ts         # 用户管理路由
│   │   └── api.ts           # API 路由
│   ├── middleware/
│   │   ├── auth.ts          # 认证中间件
│   │   └── cors.ts          # CORS 中间件
│   ├── types/
│   │   └── global.ts        # 全局类型定义
│   └── db/
│       ├── migrations       # 迁移文件
│       └── schema/          # Drizzle 数据库模式定义
├── drizzle.config.ts         # Drizzle 配置文件
├── worker-configuration.d.ts # Cloudflare Workers 类型定义
├── wrangler.jsonc           # Cloudflare Workers 配置
├── vite.config.ts            # Vite 配置
├── package.json
├── tsconfig.json
└── README.md
```

## 环境准备

### 1. 创建项目

首先创建一个新的项目并安装必要的依赖：

```bash
# 创建项目目录 选择 cloudflare-workers+vite 模板
bun create hono@latest

# 安装核心依赖
bun add better-auth drizzle-orm
bun add -D drizzle-kit

# 安装其他依赖
bun add zod dotenv
```

### 2. 配置 TypeScript

生成 wrangler 类型文件

```shell
bun cf-typegen
```

将生成的 `worker-configuration.d.ts` 添加到 `tsconfig.json` 中：

```json
{
  "compilerOptions": {
    "types": ["worker-configuration.d.ts"]
  }
}
```

### 3. 配置 Wrangler

编辑 `wrangler.jsonc`：

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "compatibility_date": "2025-08-03",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_id": "xxxx-xxxx-xxxx",
      "database_name": "hono-cloudflare-workers-d1"
    }
  ],
  "main": "./src/index.tsx",
  "name": "hono-cloudflare-workers",
  "observability": {
    "logs": {
      "enabled": true
    }
  },
  "vars": {
    "BETTER_AUTH_SECRET": "xxxx",
    "BETTER_AUTH_URL": "http://localhost:3000",
    "CLOUDFLARE_ACCOUNT_ID": "xxxx",
    "CLOUDFLARE_D1_TOKEN": "xxxx",
    "CLOUDFLARE_DATABASE_ID": "xxxx"
  }
}
```

### 4. 配置 Drizzle

创建 `drizzle.config.ts`：

```typescript
import type { Config } from 'drizzle-kit'

export default {
  // 不指定后缀表明读取 schema 文件夹下的所有文件
  schema: './src/db/schema',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
} satisfies Config
```

## 数据库设置

### 1. 创建 D1 数据库

使用 Wrangler CLI 创建 D1 数据库：

```bash
# 创建数据库
wrangler d1 create hono-cloudflare-workers-d1

# 输出示例：
# ✅ Successfully created DB 'hono-template-db' in region APAC
# Created your database using D1's new storage backend.
#
# [[d1_databases]]
# binding = "DB"
# database_name = "hono-cloudflare-workers-d1"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

将输出的配置信息添加到 `wrangler.jsonc` 文件中。

### 2. 创建 Drizzle 数据库模式

创建 `src/db/schema/auth.ts`：

```typescript
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .$defaultFn(() => false)
    .notNull(),
  id: text('id').primaryKey(),
  image: text('image'),
  name: text('name').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = sqliteTable('session', {
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  ipAddress: text('ip_address'),
  token: text('token').notNull().unique(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  accessToken: text('access_token'),
  accessTokenExpiresAt: integer('access_token_expires_at', {
    mode: 'timestamp',
  }),
  accountId: text('account_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  idToken: text('id_token'),
  password: text('password'),
  providerId: text('provider_id').notNull(),
  refreshToken: text('refresh_token'),
  refreshTokenExpiresAt: integer('refresh_token_expires_at', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const verification = sqliteTable('verification', {
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  value: text('value').notNull(),
})
```

### 3. 执行数据库迁移

#### 使用 Drizzle 迁移（推荐）

```bash
# 生成迁移文件
npx drizzle-kit generate

# 应用迁移到本地开发环境
npx wrangler d1 migrations apply YOUR_DB_NAME --local

# 应用迁移到生产环境
npx drizzle-kit push
```

## 核心实现

### 1. 全局类型定义

编辑 `worker-configuration.d.ts` 中的 `CloudflareBindings`:

```ts
interface CloudflareBindings extends Cloudflare.Env {
  DB: D1Database
  CLOUDFLARE_ACCOUNT_ID: string
  CLOUDFLARE_DATABASE_ID: string
  CLOUDFLARE_D1_TOKEN: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  CORS_ORIGIN: string
}
```

创建 `src/types/global.ts`：

```typescript
import type { Session, User } from 'better-auth'

export type HonoVariables = {
  user: User
  session: Session
}
```

### 2. Drizzle 数据库配置

创建 `src/db/index.ts`：

```typescript
import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../db/schema'

export const db = drizzle(env.DB, { schema })
```

### 3. BetterAuth 配置

创建 `src/lib/better-auth/index.ts`：

```typescript
import { env } from 'cloudflare:workers'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db'
import * as schema from '@/db/schema/auth'
import { betterAuthOptions } from './options'

export const auth = betterAuth({
  ...betterAuthOptions,
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      account: schema.account,
      session: schema.session,
      user: schema.user,
      verification: schema.verification,
    },
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
})
```

创建 `src/lib/better-auth/options.ts`：

```ts
import type { BetterAuthOptions } from 'better-auth'

/**
 * Custom options for Better Auth
 *
 * Docs: https://www.better-auth.com/docs/reference/options
 */
export const betterAuthOptions: BetterAuthOptions = {
  /**
   * The name of the application.
   */
  appName: 'hono-cloudflare-workers',
  /**
   * Base path for Better Auth.
   * @default "/api/auth"
   */
  basePath: '/api/auth',
  /**
   * Email and password provider.
   */
  emailAndPassword: {
    enabled: true,
  },
  // 高级配置
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none', // 跨站点 cookie 策略
      secure: true, // 仅 HTTPS 传输
      httpOnly: true, // 禁止 JS 访问
    },
  },
}
```

### 4. 中间件实现

创建 `src/middleware/auth.ts`：

```typescript
import type { Context, Next } from 'hono'
import { whiteRoutes } from '@/constants'
import { auth } from '@/lib/better-auth'
import type { HonoVariables } from '@/types/global'

/**
 * 路由鉴权中间件
 */
export const authMiddlewareHandler = async (
  c: Context<{
    Bindings: CloudflareBindings
    Variables: HonoVariables
  }>,
  next: Next,
) => {
  // 排除白名单路径的 session 校验
  if (whiteRoutes.includes(c.req.path)) {
    return next()
  }

  const session = await auth(c.env).api.getSession({
    headers: c.req.raw.headers,
  })
  if (!session) {
    c.set('user', null)
    c.set('session', null)
    c.status(401)
    return c.json({
      code: 401,
      message: '未登录',
    })
  }

  c.set('user', session.user)
  c.set('session', session.session)
  return next()
}
```

创建 `src/middleware/cors.ts`：

```typescript
import type { MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'
import type { HonoVariables } from '@/types/global'

type Middleware = MiddlewareHandler<
  {
    Bindings: CloudflareBindings
    Variables: HonoVariables
  },
  '*',
  Record<string, unknown>
>

/**
 * CORS 中间件
 */
export const corsMiddlewareHandler: Middleware = async (c, next) => {
  const handler = cors({
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
    credentials: true,
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    origin: [c.env.CORS_ORIGIN],
  })
  return handler(c, next)
}
```

### 5. 路由实现

创建 `src/routes/auth.ts`：

```typescript
import { Hono } from 'hono'
import { auth } from '@/lib/better-auth'

const app = new Hono<HonoContext>()

// better-auth 处理器
app.on(['POST', 'GET'], '/auth/*', async (c) => {
  const response = await auth(c.env).handler(c.req.raw)

  // 确保响应包含正确的 CORS 头部
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
})

export default app
```

创建 `src/routes/users.ts`：

```typescript
import { Hono } from 'hono'
import { Env } from '../types/global'
import { DatabaseService } from '../lib/database'
import { db } from '@/db'

const users = new Hono<{ Bindings: Env }>()

// 获取当前用户信息
users.get('/me', async (c) => {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  return c.json({ user })
})

// 更新用户信息
users.put('/me', async (c) => {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  const body = await c.req.json()
  const { name, avatar } = body

  try {
    const updatedUser = await db.updateUser(user.id, {
      name,
      avatar,
    })

    return c.json({ user: updatedUser })
  } catch (error) {
    console.error('Failed to update user:', error)
    return c.json({ error: 'Failed to update user' }, 500)
  }
})

// 获取用户列表（管理员功能）
users.get('/', async (c) => {
  try {
    // 使用 Drizzle 查询
    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt)

    return c.json({ users: userList })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// 获取用户统计信息
users.get('/stats', async (c) => {
  try {
    const userCount = await db.getUserCount()
    const activeSessionCount = await db.getActiveSessionCount()

    return c.json({
      stats: {
        totalUsers: userCount,
        activeSessions: activeSessionCount,
      },
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return c.json({ error: 'Failed to fetch stats' }, 500)
  }
})

// 删除用户账户
users.delete('/me', async (c) => {
  const user = c.get('user')

  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }

  try {
    // 删除用户会话
    await db.deleteUserSessions(user.id)

    // 删除用户
    const deleted = await db.deleteUser(user.id)

    if (!deleted) {
      return c.json({ error: 'Failed to delete user' }, 500)
    }

    return c.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return c.json({ error: 'Failed to delete user' }, 500)
  }
})

export default users
```

创建 `src/routes/api.ts`：

```typescript
import { Hono } from 'hono'
import { Env } from '../types/global'

const api = new Hono<{ Bindings: Env }>()

// 健康检查
api.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// 获取服务器信息
api.get('/info', (c) => {
  return c.json({
    name: 'Hono Cloudflare Template',
    description: 'A template for building APIs with Hono, Cloudflare Workers, D1, and BetterAuth',
    features: [
      'Authentication with BetterAuth',
      'D1 Database integration',
      'TypeScript support',
      'Edge computing with Cloudflare Workers',
    ],
  })
})

export default api
```

### 6. 主应用入口

创建 `src/index.ts`：

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { Env } from './types/global'
import { corsMiddleware } from './middleware/cors'
import { authMiddleware, requireAuth } from './middleware/auth'

// 导入路由
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import apiRoutes from './routes/api'

const app = new Hono<{ Bindings: Env }>()

// 全局中间件
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', corsMiddleware)
app.use('*', authMiddleware)

// 公开路由
app.route('/api', apiRoutes)
app.route('/auth', authRoutes)

// 需要认证的路由
app.use('/api/users/*', requireAuth)
app.route('/api/users', userRoutes)

// 根路径
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to Hono + Cloudflare Workers + D1 + BetterAuth Template!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      auth: '/auth/*',
      users: '/api/users/*',
    },
    documentation: 'https://github.com/your-username/hono-cloudflare-template',
  })
})

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

// 错误处理
app.onError((err, c) => {
  console.error('Application error:', err)
  return c.json({ error: 'Internal Server Error' }, 500)
})

export default app
```

## 部署和配置

### 1. 环境变量配置

在 Cloudflare Workers 控制台中设置以下环境变量：

或者在 `wrangler.jsonc` 中配置环境变量：

```json
{
  "vars": {}
}
```

### 2. Package.json 脚本

更新 `package.json` 添加必要的脚本：

```json
{
  "name": "hono-cloudflare-template",
  "version": "1.0.0",
  "scripts": {
    "build": "vite build",
    "cf-typegen": "wrangler types --env-interface CloudflareBindings",
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "better-auth": "^1.0.0",
    "drizzle-orm": "^0.33.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "wrangler": "^3.0.0",
    "typescript": "^5.0.0",
    "drizzle-kit": "^0.24.0",
    "tsx": "^4.0.0"
  }
}
```

### 3. Drizzle 开发工作流

#### 生成迁移文件

```bash
# 根据 schema 生成迁移文件
npm run db:generate
```

#### 应用迁移

```bash
# 本地开发环境
npx wrangler d1 migrations apply YOUR_DB_NAME --local
```

#### 直接推送 schema（开发时使用）

```bash
# 生产环境（谨慎使用）
npm run db:push
```

#### 使用 Drizzle Studio

```bash
# 启动可视化数据库管理工具
npm run db:studio
```

### 3. 本地开发

```bash
# 启动本地开发服务器
npm run dev

# 在另一个终端中运行数据库迁移（首次运行）
npx wrangler d1 migrations apply YOUR_DB_NAME --local
```

### 4. 生产部署

```bash
# 部署到 Cloudflare Workers
npm run deploy
```

## 最佳实践

**1. 安全性**

- **环境变量管理**：敏感信息使用 Cloudflare Workers Secrets
- **CORS 配置**：严格限制允许的域名
- **输入验证**：对所有用户输入进行验证和清理
- **会话管理**：定期清理过期会话

**2. 性能优化**

- **数据库查询优化**：使用索引和适当的查询模式
- **缓存策略**：利用 Cloudflare 的缓存功能
- **错误处理**：实现全面的错误处理和日志记录

**3. 监控和日志**

```typescript
// 添加请求日志中间件
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const end = Date.now()

  console.log(`${c.req.method} ${c.req.url} - ${c.res.status} - ${end - start}ms`)
})
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `wrangler.jsonc` 中的数据库配置
   - 确保数据库已创建并执行了迁移

2. **认证失败**
   - 检查 BetterAuth 配置中的 baseURL

3. **CORS 错误**
   - 更新 CORS 中间件中的允许域名
   - 确保前端请求包含正确的头信息

4. **部署失败**
   - 检查 TypeScript 编译错误
   - 验证所有依赖项都已正确安装

### 调试技巧

```typescript
// 添加详细的错误日志
app.onError((err, c) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: c.req.url,
    method: c.req.method,
    headers: Object.fromEntries(c.req.header()),
  })

  return c.json(
    {
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
    },
    500,
  )
})
```

## 总结

通过本文，我们成功构建了一个基于 Hono + Cloudflare Workers + D1 + BetterAuth 的现代化后端开发模板。这个技术栈提供了：

### 主要优势

1. **高性能**：边缘计算带来的极低延迟
2. **成本效益**：Cloudflare 的慷慨免费额度
3. **开发体验**：TypeScript 全栈类型安全
4. **可扩展性**：全球分布式架构
5. **安全性**：现代化的认证和授权机制

### 适用场景

- **API 服务**：构建高性能的 RESTful API
- **全栈应用**：配合前端框架构建完整应用
- **微服务架构**：作为微服务的基础模板
- **原型开发**：快速验证想法和概念

### 下一步

1. **前端集成**：配合 React、Vue 或 Svelte 构建完整应用
2. **CI/CD 流水线**：使用 GitHub Actions 自动化部署
3. **监控告警**：集成 Cloudflare Analytics 和第三方监控服务
4. **性能优化**：根据实际使用情况进行针对性优化

这个模板为现代 Web 应用开发提供了一个坚实的基础，你可以根据具体需求进行定制和扩展。

## 参考资源

- [Hono 官方文档](https://hono.dev/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)
- [BetterAuth 文档](https://www.better-auth.com/)
- [项目源码](https://github.com/langliu/hono-cloudflare-workers)
