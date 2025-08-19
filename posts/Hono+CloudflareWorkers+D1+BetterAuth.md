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

### [Hono](https://hono.dev/)

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
│   │   └── global.ts      # 全局类型定义
│   └── db/
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
# database_name = "hono-template-db"
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
npx drizzle-kit migrate --local

# 应用迁移到生产环境
npx drizzle-kit push
```

#### 使用传统 SQL 迁移

```bash
# 本地开发环境
wrangler d1 execute hono-template-db --local --file=./src/drizzle/<database>.sql

# 生产环境
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
  BETTER_AUTH_URL: string
}
```

创建 `src/types/global.ts`：

```typescript
import type { Session, User } from 'better-auth'

export type HonoVariables = {
  user: User | null
  session: Session | null
}
```

### 2. Drizzle 数据库配置

创建 `src/lib/drizzle.ts`：

```typescript
import { drizzle } from 'drizzle-orm/d1'
import { Env } from '../types/global'
import * as schema from '../db/schema'

export function createDrizzleDB(env: Env) {
  return drizzle(env.DB, { schema })
}

export type DrizzleDB = ReturnType<typeof createDrizzleDB>
```

### 3. Drizzle 数据库服务

创建 `src/lib/database.ts`：

```typescript
import { eq, and } from 'drizzle-orm'
import { DrizzleDB } from './drizzle'
import { users, sessions, accounts, type NewUser, type NewSession, type User } from '../db/schema'

export class DatabaseService {
  constructor(private db: DrizzleDB) {}

  // 用户相关操作
  async createUser(userData: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(userData).returning()
    return user
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id))
    return user
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email))
    return user
  }

  async updateUser(
    id: string,
    updates: Partial<{
      name: string
      avatar: string
      emailVerified: boolean
    }>,
  ): Promise<User | undefined> {
    if (Object.keys(updates).length === 0) return undefined

    const [updatedUser] = await this.db
      .update(users)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning()

    return updatedUser
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id))
    return result.changes > 0
  }

  // 会话相关操作
  async createSession(sessionData: NewSession) {
    const [session] = await this.db.insert(sessions).values(sessionData).returning()
    return session
  }

  async getSession(sessionId: string) {
    const [session] = await this.db.select().from(sessions).where(eq(sessions.id, sessionId))
    return session
  }

  async getSessionWithUser(sessionId: string) {
    const result = await this.db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId))

    return result[0]
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await this.db.delete(sessions).where(eq(sessions.id, sessionId))
    return result.changes > 0
  }

  async deleteExpiredSessions(): Promise<boolean> {
    const now = new Date().toISOString()
    const result = await this.db.delete(sessions).where(eq(sessions.expiresAt, now))
    return result.changes > 0
  }

  async deleteUserSessions(userId: string): Promise<boolean> {
    const result = await this.db.delete(sessions).where(eq(sessions.userId, userId))
    return result.changes > 0
  }

  // 账户相关操作（OAuth）
  async createAccount(accountData: typeof accounts.$inferInsert) {
    const [account] = await this.db.insert(accounts).values(accountData).returning()
    return account
  }

  async getAccountByProvider(provider: string, providerAccountId: string) {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)),
      )
    return account
  }

  async getUserAccounts(userId: string) {
    return await this.db.select().from(accounts).where(eq(accounts.userId, userId))
  }

  // 统计相关
  async getUserCount(): Promise<number> {
    const result = await this.db.select({ count: users.id }).from(users)
    return result.length
  }

  async getActiveSessionCount(): Promise<number> {
    const now = new Date().toISOString()
    const result = await this.db
      .select({ count: sessions.id })
      .from(sessions)
      .where(eq(sessions.expiresAt, now))
    return result.length
  }
}
```

### 4. 传统数据库服务（可选）

如果您更喜欢使用原生 SQL，可以创建传统的数据库服务：

```typescript
// src/lib/database-sql.ts
import { Env } from '../types/global'

export class SQLDatabaseService {
  constructor(private db: D1Database) {}

  async createUser(userData: { id: string; email: string; name?: string; avatar?: string }) {
    const { id, email, name, avatar } = userData

    const result = await this.db
      .prepare(
        `INSERT INTO users (id, email, name, avatar)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(id, email, name, avatar)
      .run()

    if (!result.success) {
      throw new Error('Failed to create user')
    }

    return this.getUserById(id)
  }

  async getUserById(id: string) {
    const result = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first()
    return result
  }

  async getUserByEmail(email: string) {
    const result = await this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
    return result
  }

  // ... 其他方法
}
```

### 3. BetterAuth 配置

创建 `src/lib/better-auth/index.ts`：

```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/db/schema/auth'
import { betterAuthOptions } from './options'

export const auth = (env: CloudflareBindings): ReturnType<typeof betterAuth> => {
  const db = drizzle(env.DB, { schema })

  return betterAuth({
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
    trustedOrigins: [env.BETTER_AUTH_URL, 'http://localhost:3000'],
  })
}
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
}
```

### 4. 中间件实现

创建 `src/middleware/auth.ts`：

```typescript
import { Context, Next } from 'hono'
import { Env } from '../types/global'
import { createAuth } from '../lib/auth'

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const auth = createAuth(c.env)

  // 将 auth 实例添加到上下文中
  c.set('auth', auth)

  await next()
}

export async function requireAuth(c: Context<{ Bindings: Env }>, next: Next) {
  const auth = c.get('auth')

  if (!auth) {
    return c.json({ error: 'Authentication not configured' }, 500)
  }

  const session = await auth.api.getSession({
    headers: c.req.header(),
  })

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // 将用户信息添加到上下文中
  c.set('user', session.user)
  c.set('session', session.session)

  await next()
}
```

创建 `src/middleware/cors.ts`：

```typescript
import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'https://your-domain.com'], // 替换为你的前端域名
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
})
```

### 5. 路由实现

创建 `src/routes/auth.ts`：

```typescript
import { Hono } from 'hono'
import { Env } from '../types/global'

const auth = new Hono<{ Bindings: Env }>()

// 处理所有认证相关的请求
auth.all('/*', async (c) => {
  const authInstance = c.get('auth')

  if (!authInstance) {
    return c.json({ error: 'Authentication not configured' }, 500)
  }

  return authInstance.handler(c.req.raw)
})

export default auth
```

创建 `src/routes/users.ts`：

```typescript
import { Hono } from 'hono'
import { Env } from '../types/global'
import { DatabaseService } from '../lib/database'
import { createDrizzleDB } from '../lib/drizzle'

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

  // 使用 Drizzle
  const drizzleDB = createDrizzleDB(c.env)
  const db = new DatabaseService(drizzleDB)

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
  const drizzleDB = createDrizzleDB(c.env)
  const db = new DatabaseService(drizzleDB)

  try {
    // 使用 Drizzle 查询
    const userList = await drizzleDB
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
  const drizzleDB = createDrizzleDB(c.env)
  const db = new DatabaseService(drizzleDB)

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

  const drizzleDB = createDrizzleDB(c.env)
  const db = new DatabaseService(drizzleDB)

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

```bash
# 必需的环境变量
JWT_SECRET=your-super-secret-jwt-key-here

# OAuth 配置（可选）
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

或者在 `wrangler.toml` 中配置：

```toml
[vars]
NODE_ENV = "production"
JWT_SECRET = "your-super-secret-jwt-key-here"

# 对于敏感信息，建议使用 secrets
# wrangler secret put GITHUB_CLIENT_SECRET
# wrangler secret put GOOGLE_CLIENT_SECRET
```

### 2. Package.json 脚本

更新 `package.json` 添加必要的脚本：

```json
{
  "name": "hono-cloudflare-template",
  "version": "1.0.0",
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc",
    "deploy": "wrangler deploy",
    "db:create": "wrangler d1 create hono-template-db",
    "db:generate": "drizzle-kit generate",
    "db:migrate:local": "drizzle-kit migrate --local",
    "db:migrate:prod": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push:local": "drizzle-kit push --local",
    "db:push:prod": "drizzle-kit push",
    "db:seed": "tsx src/scripts/seed.ts",
    "db:reset": "tsx src/scripts/reset.ts",
    "type-check": "tsc --noEmit"
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
npm run db:migrate:local

# 生产环境
npm run db:migrate:prod
```

#### 直接推送 schema（开发时使用）

```bash
# 本地开发环境
npm run db:push:local

# 生产环境（谨慎使用）
npm run db:push:prod
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
npm run db:migrate:local
```

### 4. 生产部署

```bash
# 首次部署前创建生产数据库
npm run db:migrate:prod

# 部署到 Cloudflare Workers
npm run deploy
```

## 使用示例

### 1. 用户注册

```bash
curl -X POST https://your-domain.com/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

### 2. 用户登录

```bash
curl -X POST https://your-domain.com/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 3. 获取用户信息

```bash
curl -X GET https://your-domain.com/api/users/me \
  -H "Authorization: Bearer your-session-token"
```

### 4. GitHub OAuth 登录

访问：`https://your-domain.com/auth/sign-in/github`

## 最佳实践

### 1. 安全性

- **环境变量管理**：敏感信息使用 Cloudflare Workers Secrets
- **CORS 配置**：严格限制允许的域名
- **输入验证**：对所有用户输入进行验证和清理
- **会话管理**：定期清理过期会话

### 2. 性能优化

- **数据库查询优化**：使用索引和适当的查询模式
- **缓存策略**：利用 Cloudflare 的缓存功能
- **错误处理**：实现全面的错误处理和日志记录

### 3. 监控和日志

```typescript
// 添加请求日志中间件
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const end = Date.now()

  console.log(`${c.req.method} ${c.req.url} - ${c.res.status} - ${end - start}ms`)
})
```

## 扩展功能

### 1. 添加邮件验证

```typescript
// src/lib/email.ts
export async function sendVerificationEmail(email: string, token: string) {
  // 使用 Cloudflare Workers 发送邮件
  // 可以集成 SendGrid、Mailgun 等服务
}
```

### 2. 添加角色权限系统

```sql
-- 添加角色表
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 添加用户角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);
```

### 3. 添加 API 限流

```typescript
// src/middleware/rateLimit.ts
import { Context, Next } from 'hono'

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(maxRequests: number, windowMs: number) {
  return async (c: Context, next: Next) => {
    const clientIP = c.req.header('CF-Connecting-IP') || 'unknown'
    const now = Date.now()
    const windowStart = now - windowMs

    const clientData = rateLimitMap.get(clientIP)

    if (!clientData || clientData.resetTime < windowStart) {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs })
      await next()
      return
    }

    if (clientData.count >= maxRequests) {
      return c.json({ error: 'Too Many Requests' }, 429)
    }

    clientData.count++
    await next()
  }
}
```

### 4. 添加数据验证

```typescript
// src/lib/validation.ts
import { z } from 'zod'

export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
})
```

### 5. Drizzle 高级查询示例

```typescript
// src/lib/advanced-queries.ts
import { eq, and, or, like, desc, count, sql } from 'drizzle-orm'
import { DrizzleDB } from './drizzle'
import { users, sessions, accounts } from '../db/schema'

export class AdvancedQueries {
  constructor(private db: DrizzleDB) {}

  // 复杂的用户查询
  async searchUsers(searchTerm: string, limit = 10, offset = 0) {
    return await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatar: users.avatar,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(or(like(users.name, `%${searchTerm}%`), like(users.email, `%${searchTerm}%`)))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset)
  }

  // 获取用户及其会话信息
  async getUserWithSessions(userId: string) {
    return await this.db
      .select({
        user: users,
        sessions: {
          id: sessions.id,
          expiresAt: sessions.expiresAt,
          createdAt: sessions.createdAt,
        },
      })
      .from(users)
      .leftJoin(sessions, eq(users.id, sessions.userId))
      .where(eq(users.id, userId))
  }

  // 获取用户统计信息
  async getUserStats() {
    const [totalUsers] = await this.db.select({ count: count() }).from(users)

    const [activeUsers] = await this.db
      .select({ count: count() })
      .from(users)
      .innerJoin(sessions, eq(users.id, sessions.userId))
      .where(sql`${sessions.expiresAt} > datetime('now')`)

    const [verifiedUsers] = await this.db
      .select({ count: count() })
      .from(users)
      .where(eq(users.emailVerified, true))

    return {
      total: totalUsers.count,
      active: activeUsers.count,
      verified: verifiedUsers.count,
    }
  }

  // 批量操作示例
  async batchCreateUsers(userData: Array<typeof users.$inferInsert>) {
    return await this.db.insert(users).values(userData).returning()
  }

  // 事务示例
  async transferUserData(fromUserId: string, toUserId: string) {
    return await this.db.transaction(async (tx) => {
      // 转移会话
      await tx.update(sessions).set({ userId: toUserId }).where(eq(sessions.userId, fromUserId))

      // 转移账户
      await tx.update(accounts).set({ userId: toUserId }).where(eq(accounts.userId, fromUserId))

      // 删除原用户
      await tx.delete(users).where(eq(users.id, fromUserId))

      return { success: true }
    })
  }
}
```

### 6. 数据库种子脚本

创建 `src/scripts/seed.ts`：

```typescript
import { drizzle } from 'drizzle-orm/d1'
import { users, accounts } from '../db/schema'

// 这是一个示例种子脚本
export async function seedDatabase(db: D1Database) {
  const drizzleDB = drizzle(db)

  // 创建测试用户
  const testUsers = [
    {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin User',
      emailVerified: true,
    },
    {
      id: 'user-2',
      email: 'user@example.com',
      name: 'Regular User',
      emailVerified: false,
    },
  ]

  await drizzleDB.insert(users).values(testUsers)

  console.log('Database seeded successfully!')
}
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `wrangler.toml` 中的数据库配置
   - 确保数据库已创建并执行了迁移

2. **认证失败**
   - 验证 JWT_SECRET 环境变量
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
- [项目源码](https://github.com/your-username/hono-cloudflare-template)

---

_本文介绍的技术栈代表了现代 Web 开发的前沿趋势，希望能为你的项目开发提供有价值的参考。_
