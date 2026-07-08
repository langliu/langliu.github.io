---
title: 'SQLite 入门：特点、语法、数据类型与 Drizzle 实践'
description: '本文介绍 SQLite 的核心特点、常用 SQL 语法、动态类型系统、类型亲和性，以及如何在 TypeScript 项目中结合 Drizzle 使用 SQLite。'
publishedAt: 2026-07-08
tags:
  - SQLite
  - SQL
  - Drizzle
  - TypeScript
slug: sqlite-beginner-drizzle
isPublish: true
category: 'TypeScript'
---

很多人第一次接触数据库时，默认会想到 MySQL、PostgreSQL 这种需要单独启动服务的数据库。

但如果你只是想给一个脚本、桌面应用、小型 Web 服务、测试环境或本地原型加一个可靠的数据存储，SQLite 往往是更轻的选择。

SQLite 不是“玩具数据库”。它的定位很明确：**把一个完整的 SQL 数据库引擎嵌入到应用里**。你不需要部署数据库服务，不需要配置用户权限，也不需要维护单独的数据库进程。大多数时候，一个 `.db` 文件就够了。

本文从四个角度入门 SQLite：

- SQLite 有什么特点
- SQLite 常用语法怎么写
- SQLite 的数据类型和其他数据库有什么区别
- 如何在 TypeScript 项目里结合 Drizzle 使用

## SQLite 是什么？

SQLite 是一个嵌入式 SQL 数据库引擎。

和 MySQL、PostgreSQL 最大的区别是：SQLite 没有独立的数据库服务器进程。应用程序通过 SQLite 库直接读写数据库文件。

一个完整的 SQLite 数据库通常就是一个普通文件，例如：

```text
app.db
```

这个文件里可以包含多张表、索引、视图和触发器。你可以把它复制到另一台机器上，只要 SQLite 版本兼容，就可以继续读取。

这也是 SQLite 很适合下面这些场景的原因：

- 本地开发和原型验证
- CLI 工具
- 桌面应用
- 移动端应用
- 单机小型服务
- 自动化测试
- 边缘数据库，例如 Cloudflare D1、Turso/libSQL 这类 SQLite 生态方案

## SQLite 的特点

### 1. Serverless

这里的 serverless 不是云函数那个概念，而是指 SQLite **不需要数据库服务器**。

MySQL 的典型使用方式是：

```text
应用程序 -> MySQL 客户端 -> MySQL 服务进程 -> 数据文件
```

SQLite 更像这样：

```text
应用程序 -> SQLite 库 -> 数据库文件
```

少了服务进程，也就少了安装、启动、监听端口、用户权限、连接池配置这些事情。

### 2. 零配置

SQLite 的启动成本很低。

你可以直接创建一个数据库文件：

```bash
sqlite3 app.db
```

也可以在代码中直接连接：

```ts
// 伪代码
const db = openDatabase('app.db')
```

如果文件不存在，SQLite 通常会创建它。

这对本地开发非常友好：拉下项目、安装依赖、跑迁移，就能得到一个可用数据库。

### 3. 单文件数据库

SQLite 的数据库可以存放在一个普通磁盘文件中。

这带来几个好处：

- 备份简单：复制文件即可
- 迁移简单：把文件带走即可
- 本地调试简单：可以直接用 SQLite 客户端打开
- 测试简单：每个测试都可以创建一个临时数据库

当然，这也意味着你要认真处理文件权限、备份时机和并发写入场景。

### 4. 支持事务

SQLite 支持事务。你可以把多条 SQL 放在同一个事务里，要么全部成功，要么全部回滚。

```sql
BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE id = 1;

UPDATE accounts
SET balance = balance + 100
WHERE id = 2;

COMMIT;
```

如果中间失败，可以回滚：

```sql
ROLLBACK;
```

这对订单、余额、库存这类需要一致性的操作很重要。

### 5. 适合读多写少和中小规模场景

SQLite 的读性能很好，也很适合单机应用。

但它不是为“多个应用服务器同时高并发写入同一个中心数据库”设计的。如果你的系统需要大量并发写入、复杂权限管理、跨机器连接池和主从复制，PostgreSQL 或 MySQL 通常更合适。

一个实用判断是：

- 本地应用、本地缓存、小型服务、测试数据库：优先考虑 SQLite
- 多服务共享、高并发写、多租户中心数据库：优先考虑 PostgreSQL/MySQL
- 边缘场景：可以考虑 D1、Turso/libSQL 这类 SQLite 生态方案

## 基本语法

SQLite 使用标准 SQL 语法，很多语句和其他关系型数据库很像。

下面用一个博客文章表作为例子。

### 创建表

```sql
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  view_count INTEGER NOT NULL DEFAULT 0,
  is_featured INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('subsec') * 1000)
);
```

几个点需要注意：

- `IF NOT EXISTS` 可以避免表已存在时报错
- `PRIMARY KEY` 用来声明主键
- `NOT NULL` 表示不能为空
- `UNIQUE` 表示唯一约束
- `DEFAULT` 表示默认值
- `is_featured` 用 `INTEGER` 存布尔值，通常 `0` 表示 false，`1` 表示 true
- `created_at` 可以用整数保存 Unix 毫秒时间戳
- `unixepoch('subsec')` 会返回带小数的 Unix 秒级时间戳，乘以 `1000` 后可以作为毫秒时间戳默认值

### 插入数据

```sql
INSERT INTO posts (
  title,
  slug,
  content,
  status
) VALUES (
  'SQLite 入门',
  'sqlite-beginner',
  '这是一篇介绍 SQLite 的文章',
  'published'
);
```

如果字段有默认值，可以不传：

```sql
INSERT INTO posts (title, slug, content)
VALUES ('第一篇文章', 'first-post', 'Hello SQLite');
```

### 查询数据

查询所有文章：

```sql
SELECT *
FROM posts;
```

查询部分字段：

```sql
SELECT id, title, slug
FROM posts;
```

带条件查询：

```sql
SELECT id, title, slug
FROM posts
WHERE status = 'published';
```

排序和分页：

```sql
SELECT id, title, slug, created_at
FROM posts
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

### 更新数据

```sql
UPDATE posts
SET view_count = view_count + 1
WHERE slug = 'sqlite-beginner';
```

更新时一定要注意 `WHERE`。如果没有 `WHERE`，会更新整张表。

### 删除数据

```sql
DELETE FROM posts
WHERE slug = 'first-post';
```

删除也一样，要小心 `WHERE`。

### 建索引

当某个字段经常出现在 `WHERE`、`ORDER BY` 或关联查询中，可以考虑建索引。

```sql
CREATE INDEX IF NOT EXISTS posts_status_created_at_idx
ON posts (status, created_at);
```

索引不是越多越好。它能加速查询，但会增加写入成本和数据库文件体积。

### Upsert

SQLite 支持 `ON CONFLICT`，可以在唯一键冲突时更新数据。

```sql
INSERT INTO posts (title, slug, content)
VALUES ('SQLite 入门', 'sqlite-beginner', '新内容')
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  content = excluded.content;
```

这个语句的意思是：

- 如果 `slug` 不存在，就插入
- 如果 `slug` 已存在，就更新 `title` 和 `content`

## SQLite 的数据类型

SQLite 的类型系统和 MySQL、PostgreSQL 不太一样。

很多数据库是“列决定类型”：你声明某列是 `INTEGER`，这列就只能存整数。

SQLite 更接近“值决定类型”：每个值都有自己的存储类型。列的类型更多是一种建议，也就是 SQLite 文档里的 **type affinity**，通常翻译成“类型亲和性”。

### 五种存储类型

SQLite 的值有五种存储类型：

| 类型 | 含义 |
| --- | --- |
| `NULL` | 空值 |
| `INTEGER` | 整数 |
| `REAL` | 浮点数 |
| `TEXT` | 文本 |
| `BLOB` | 二进制数据 |

例如：

```sql
CREATE TABLE examples (
  id INTEGER,
  name TEXT,
  price REAL,
  data BLOB
);
```

这里的 `INTEGER`、`TEXT`、`REAL`、`BLOB` 都会影响 SQLite 存储值时的倾向，但它们不是传统意义上的强类型约束。

### 类型亲和性

SQLite 会根据列声明推导类型亲和性：

| 亲和性 | 常见声明 |
| --- | --- |
| `INTEGER` | `INTEGER`, `INT`, `BIGINT` |
| `TEXT` | `TEXT`, `VARCHAR`, `CHAR` |
| `REAL` | `REAL`, `DOUBLE`, `FLOAT` |
| `NUMERIC` | `NUMERIC`, `DECIMAL`, `BOOLEAN`, `DATE`, `DATETIME` |
| `BLOB` | `BLOB` 或未声明类型 |

重点是：亲和性是“推荐类型”，不是绝对限制。

比如：

```sql
CREATE TABLE demo (
  value INTEGER
);

INSERT INTO demo (value) VALUES ('123');
```

SQLite 可能会把字符串 `'123'` 转成整数 `123` 存储。

但如果插入的是无法转换的文本：

```sql
INSERT INTO demo (value) VALUES ('hello');
```

在普通表里，SQLite 仍然可能接受它。

如果你希望更接近强类型，可以了解 SQLite 的 `STRICT` 表：

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
) STRICT;
```

`STRICT` 表从 SQLite 3.37.0 开始提供，适合希望减少隐式类型转换的项目。

### Enum

SQLite 没有像 PostgreSQL 那样独立的 `ENUM` 类型。

如果你希望某个字段只能取固定值，最常见的做法是使用 `TEXT` 加 `CHECK` 约束。

比如用户性别字段 `sex` 只允许三种值：

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'unknown'))
);
```

插入合法值：

```sql
INSERT INTO users (name, sex)
VALUES ('Alice', 'female');
```

插入非法值会触发约束错误：

```sql
INSERT INTO users (name, sex)
VALUES ('Bob', 'secret');
```

如果业务允许不填写，也可以给一个默认值：

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  sex TEXT NOT NULL DEFAULT 'unknown'
    CHECK (sex IN ('male', 'female', 'unknown'))
);
```

这个思路同样适用于文章状态：

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived'))
);
```

也可以用 `INTEGER` 表示 enum，例如 `0`、`1`、`2`，但可读性通常不如 `TEXT`。除非你有明确的存储或兼容性要求，否则业务状态字段我更倾向用文本值。

### 布尔值

SQLite 没有单独的布尔存储类型。

通常用 `INTEGER` 存：

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0
);
```

约定：

- `0` 表示 false
- `1` 表示 true

### 日期时间

SQLite 也没有单独的日期时间存储类型。

常见做法有三种：

| 存法 | 示例 | 适合场景 |
| --- | --- | --- |
| `TEXT` | `2026-07-08 10:00:00` | 可读性好 |
| `INTEGER` | Unix 时间戳 | 排序、比较方便 |
| `REAL` | Julian day | 特定日期计算 |

在应用代码里，我更常用 `INTEGER` 保存毫秒时间戳：

```sql
created_at INTEGER NOT NULL DEFAULT (unixepoch('subsec') * 1000)
```

这里用的是数据库层默认值。相比在应用代码里生成时间，它的好处是所有插入入口都会使用同一套数据库规则。

如果你希望强制存成整数，也可以包一层 `CAST`：

```sql
created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER))
```

查询最近文章：

```sql
SELECT id, title, created_at
FROM posts
ORDER BY created_at DESC;
```

### JSON

SQLite 没有独立的 JSON 类型，但可以把 JSON 存在 `TEXT` 中，并结合 JSON 函数查询。

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]'
);
```

插入：

```sql
INSERT INTO posts (title, tags)
VALUES ('SQLite 入门', '["SQLite", "SQL"]');
```

如果项目依赖 JSON 查询，建议确认当前运行环境启用了 SQLite JSON 相关能力。

## 外键要显式开启

SQLite 支持外键，但要注意一个容易踩坑的点：外键约束需要在连接上启用。

```sql
PRAGMA foreign_keys = ON;
```

如果你定义了外键，但删除父表数据时没有触发约束或级联删除，首先检查这项是否开启。

例如：

```sql
CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  author_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (author_id) REFERENCES authors(id)
);
```

连接数据库后执行：

```sql
PRAGMA foreign_keys = ON;
```

在应用里也应该在连接初始化时设置。

## 结合 Drizzle 使用 SQLite

直接写 SQL 很清晰，但在 TypeScript 项目中，我们通常还希望得到：

- 表结构的类型提示
- 查询结果的类型推导
- 插入和更新时的字段检查
- 迁移文件管理
- 更容易组合的查询 API

Drizzle 的定位就是“接近 SQL 的 TypeScript ORM”。它不会把 SQL 完全藏起来，而是用 TypeScript 描述 schema，再用类型安全的查询 API 操作数据库。

Drizzle 支持多种 SQLite 连接方式，包括：

- `libsql`：适合本地 SQLite 文件，也适合 Turso 这类远程 libSQL 数据库
- `node:sqlite`：适合 Node.js 内置 SQLite 场景
- `better-sqlite3`：常见的同步 SQLite 驱动
- Cloudflare D1：适合 Workers/D1 环境

下面以 `libsql` 为例。

### 安装依赖

```bash
bun add drizzle-orm @libsql/client
bun add -D drizzle-kit
```

如果你使用 npm：

```bash
npm install drizzle-orm @libsql/client
npm install -D drizzle-kit
```

### 定义 schema

创建 `src/db/schema.ts`：

```ts
import { sql } from 'drizzle-orm'
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const posts = sqliteTable(
  'posts',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    content: text('content').notNull(),
    status: text('status', {
      enum: ['draft', 'published'],
    })
      .notNull()
      .default('draft'),
    viewCount: integer('view_count').notNull().default(0),
    isFeatured: integer('is_featured', {
      mode: 'boolean',
    })
      .notNull()
      .default(false),
    tags: text('tags', {
      mode: 'json',
    })
      .$type<string[]>()
      .notNull()
      .default(sql`(json_array())`),
    createdAt: integer('created_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
    updatedAt: integer('updated_at', {
      mode: 'timestamp_ms',
    })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`)
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    check('posts_status_check', sql`${table.status} IN ('draft', 'published')`),
    index('posts_status_created_at_idx').on(table.status, table.createdAt),
  ],
)
```

这里有几个 SQLite 相关的映射：

- `integer(...).primaryKey({ autoIncrement: true })` 对应自增主键
- `text(...).notNull()` 对应非空文本
- `text(..., { enum })` 只提供 TypeScript 层面的类型推导，不会自动生成数据库约束
- `check(..., sql\`...\`)` 才会生成数据库层 `CHECK` 约束，用来限制 enum 的合法取值
- `integer(..., { mode: 'boolean' })` 在代码里表现为 `boolean`，数据库里仍然存 `0/1`
- `text(..., { mode: 'json' }).$type<string[]>()` 让 JSON 字段在 TypeScript 中表现为 `string[]`
- `integer(..., { mode: 'timestamp_ms' })` 让时间字段在代码里表现为 `Date`
- `.default(sql\`(unixepoch('subsec') * 1000)\`)` 会生成数据库层默认值，用 SQLite 自己生成毫秒时间戳
- `$defaultFn(() => new Date())` 是 Drizzle 运行时默认值，不会写进迁移 SQL；如果字段可能被 SQL、脚本或其他服务直接插入，数据库层默认值更稳

### 配置 Drizzle Kit

创建 `drizzle.config.ts`：

```ts
import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'file:local.db',
  },
})
```

本地开发可以在 `.env` 中写：

```text
DATABASE_URL=file:local.db
```

如果使用 Turso/libSQL 远程数据库，通常还会有 token：

```text
DATABASE_URL=libsql://your-database.turso.io
DATABASE_AUTH_TOKEN=your-token
```

### 生成和执行迁移

根据 schema 生成迁移：

```bash
bunx drizzle-kit generate
```

执行迁移：

```bash
bunx drizzle-kit migrate
```

开发阶段如果只是快速同步 schema，也可以使用：

```bash
bunx drizzle-kit push
```

团队项目更建议保留迁移文件，让数据库结构变化可审查、可回滚、可追踪。

### 初始化数据库连接

创建 `src/db/index.ts`：

```ts
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL ?? 'file:local.db',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  schema,
})
```

如果你使用的是本地 `node:sqlite` 或 `better-sqlite3`，初始化方式会不同，但 schema 和查询写法基本一致。

### 插入数据

```ts
import { db } from './db'
import { posts } from './db/schema'

await db.insert(posts).values({
  title: 'SQLite 入门',
  slug: 'sqlite-beginner',
  content: '这是一篇介绍 SQLite 的文章',
  status: 'published',
  tags: ['SQLite', 'SQL', 'Drizzle'],
})
```

因为 schema 里已经定义了默认值，所以 `viewCount`、`isFeatured`、`createdAt`、`updatedAt` 可以不传。

### 查询数据

```ts
import { desc, eq } from 'drizzle-orm'
import { db } from './db'
import { posts } from './db/schema'

const publishedPosts = await db
  .select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug,
    createdAt: posts.createdAt,
  })
  .from(posts)
  .where(eq(posts.status, 'published'))
  .orderBy(desc(posts.createdAt))
  .limit(10)
```

查询单篇文章：

```ts
const rows = await db
  .select()
  .from(posts)
  .where(eq(posts.slug, 'sqlite-beginner'))
  .limit(1)

const post = rows[0]
```

### 更新数据

```ts
import { eq, sql } from 'drizzle-orm'
import { db } from './db'
import { posts } from './db/schema'

await db
  .update(posts)
  .set({
    viewCount: sql`${posts.viewCount} + 1`,
  })
  .where(eq(posts.slug, 'sqlite-beginner'))
```

### 删除数据

```ts
import { eq } from 'drizzle-orm'
import { db } from './db'
import { posts } from './db/schema'

await db.delete(posts).where(eq(posts.slug, 'sqlite-beginner'))
```

### 事务

Drizzle 也支持事务。

```ts
await db.transaction(async (tx) => {
  await tx.insert(posts).values({
    title: '事务里的文章',
    slug: 'transaction-post',
    content: '如果后续步骤失败，这次插入也会回滚',
  })

  await tx
    .update(posts)
    .set({
      viewCount: sql`${posts.viewCount} + 1`,
    })
    .where(eq(posts.slug, 'sqlite-beginner'))
})
```

事务适合需要保持一致性的操作，例如：

- 创建订单，同时扣减库存
- 创建用户，同时创建用户资料
- 删除主记录，同时删除关联记录

## Drizzle 与原生 SQL 怎么取舍？

我通常会这样选择：

- 简单 CRUD：优先用 Drizzle 查询 API
- 需要类型推导的业务查询：优先用 Drizzle
- 很复杂的统计查询：可以直接写 SQL
- 使用 SQLite 特定函数：可以结合 Drizzle 的 `sql` 模板

例如：

```ts
import { sql } from 'drizzle-orm'

const rows = await db.all(sql`
  SELECT
    status,
    COUNT(*) AS count
  FROM posts
  GROUP BY status
`)
```

不要把 ORM 当成“禁止写 SQL”的工具。Drizzle 的优势恰好是它比较接近 SQL，并且允许你在需要时回到 SQL。

## 实战建议

### 1. 一开始就写迁移

即使是小项目，也建议把 schema 变化记录成迁移文件。

直接手改数据库很快，但几个月后你很难回答：

- 线上数据库现在是什么结构？
- 本地数据库为什么和线上不一样？
- 这次字段变更从哪个版本开始？

迁移文件能解决这些问题。

### 2. 为常用查询建索引

如果文章列表经常按 `status + created_at` 查询，就建组合索引：

```ts
index('posts_status_created_at_idx').on(table.status, table.createdAt)
```

但不要盲目建索引。先从真实查询出发，再看是否需要优化。

### 3. 明确时间存储策略

团队里要提前约定时间字段怎么存：

- 存秒级时间戳
- 存毫秒级时间戳
- 存 ISO 字符串
- 是否统一 UTC

不要同一个项目里混着来。

### 4. 布尔值和 JSON 要知道底层存法

Drizzle 可以让你在 TypeScript 中用 `boolean`、`string[]`、对象类型，但 SQLite 底层仍然是 `INTEGER`、`TEXT` 或 `BLOB`。

类型提示不等于运行时校验。

如果数据来自用户输入，仍然建议配合 Zod、Valibot 或其他校验库。

### 5. 外键记得启用

如果你依赖外键约束，连接建立后要确保执行：

```sql
PRAGMA foreign_keys = ON;
```

不同驱动的启用方式可能不一样，可以在数据库初始化逻辑里统一处理。

## 扩展：时间字段与主键怎么选

前面的示例为了方便查询和排序，使用了 `INTEGER` 保存毫秒级 Unix 时间戳，并使用 `INTEGER PRIMARY KEY` 作为主键。

这不是唯一选择。实际建模时，时间字段和主键字段都值得提前约定。

### 时间字段：Unix 时间戳还是 ISO 8601 字符串？

SQLite 没有独立的 `DATETIME` 存储类型。常见做法是二选一：

- 用 `INTEGER` 保存 Unix 时间戳，例如 `1720425600123`
- 用 `TEXT` 保存 ISO 8601 字符串，例如 `2026-07-08T10:20:30.123Z`

二者都可以工作，区别主要在读写体验和跨系统协作。

#### 方案一：Unix 毫秒时间戳

建表时可以这样写：

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER))
);
```

如果不想强制转整数，也可以写：

```sql
created_at INTEGER NOT NULL DEFAULT (unixepoch('subsec') * 1000)
```

`unixepoch('subsec')` 返回带小数的秒级时间戳，乘以 `1000` 后就是毫秒级时间戳。

查询最近记录：

```sql
SELECT id, name, created_at
FROM events
ORDER BY created_at DESC
LIMIT 20;
```

范围查询：

```sql
SELECT id, name
FROM events
WHERE created_at >= 1767225600000
  AND created_at < 1769817600000;
```

Unix 时间戳的优点：

- 排序和范围查询直接按数字比较
- 存储紧凑
- 和 JavaScript 的 `Date.now()`、`date.getTime()` 很容易对应
- 适合大量时间计算、分页、增量同步

缺点也很明显：

- 数据库里直接看不直观
- 需要转换后才适合展示
- 需要团队统一秒、毫秒还是微秒，否则很容易混用

如果你用 Drizzle，可以这样定义：

```ts
createdAt: integer('created_at', {
  mode: 'timestamp_ms',
})
  .notNull()
  .default(sql`(unixepoch('subsec') * 1000)`)
```

这样在 TypeScript 里读出来可以按 `Date` 使用，数据库里仍然是整数时间戳。

#### 方案二：ISO 8601 字符串

另一种做法是存成 UTC 字符串：

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

写入后的值类似：

```text
2026-07-08T10:20:30.123Z
```

如果始终使用这种固定宽度、从大到小排列的 UTC 格式，字符串排序和时间排序是一致的：

```sql
SELECT id, name, created_at
FROM events
ORDER BY created_at DESC;
```

ISO 8601 字符串的优点：

- 数据库里直接可读
- 日志、接口、调试都友好
- 跨语言、跨系统交换时语义清晰
- 只要统一 UTC 和固定格式，排序也很自然

缺点：

- 比整数占用更多空间
- 做时间差、加减运算时不如整数直接
- 必须统一格式，尤其是 `Z`、时区偏移、毫秒位数

Drizzle 中可以定义为：

```ts
createdAt: text('created_at')
  .notNull()
  .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`)
```

#### 怎么选？

我的建议是：

| 场景 | 推荐 |
| --- | --- |
| 需要频繁排序、分页、范围查询 | Unix 毫秒时间戳 |
| 需要大量时间计算 | Unix 毫秒时间戳 |
| 主要用于展示、导出、日志排查 | ISO 8601 字符串 |
| 数据经常跨系统交换 | ISO 8601 字符串 |
| 前端/Node 项目内部使用 | Unix 毫秒时间戳或 ISO 都可以，关键是统一 |

如果是偏业务系统、需要经常按时间查询，我更倾向 `INTEGER` 毫秒时间戳。

如果是配置、审计日志、导出数据，或者你希望数据库文件可读性更好，ISO 8601 字符串也很合适。

最重要的是：**不要在同一个项目里混用多种格式**。

### 主键：INTEGER 还是 UUID？

SQLite 中最常见的主键写法是：

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL
);
```

在 SQLite 里，`INTEGER PRIMARY KEY` 有特殊含义：它会成为 `ROWID` 的别名。也就是说，SQLite 可以非常高效地用这个整数定位一行数据。

插入时可以不传 `id`：

```sql
INSERT INTO posts (title)
VALUES ('SQLite 入门');
```

SQLite 会自动分配一个整数主键。

#### INTEGER 主键的优点

- 存储小
- 索引小
- 插入和查询效率高
- 自增顺序对本地数据库很友好
- SQL 调试简单，例如 `WHERE id = 1`

缺点：

- ID 可预测
- 多端离线写入时容易冲突
- 数据合并、跨库同步时要额外处理 ID 映射
- 不适合作为公开接口里的不可猜测资源标识

需要注意的是，`INTEGER PRIMARY KEY` 通常已经够用，不一定要写 `AUTOINCREMENT`。

`AUTOINCREMENT` 的意义是避免复用历史上出现过的 ROWID，但它会引入额外开销。除非你明确要求“删除过的 ID 永不复用”，否则普通的 `INTEGER PRIMARY KEY` 更常见。

#### UUID 主键

UUID 通常存成 `TEXT`：

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL
);
```

插入时由应用生成：

```ts
const id = crypto.randomUUID()
```

Drizzle 中可以这样写：

```ts
id: text('id')
  .primaryKey()
  .$defaultFn(() => crypto.randomUUID())
```

UUID 的优点：

- 分布式生成，不依赖数据库自增
- 多端离线写入时更不容易冲突
- 合并多个数据库时更方便
- 适合暴露在 URL 或 API 中，不容易被顺序猜测

缺点：

- 比整数更占空间
- 索引更大
- 随机 UUID 插入时局部性较差
- 手动调试没有整数 ID 直观

如果你很在意空间，也可以把 UUID 存成 16 字节 `BLOB`，但读写、调试和接口传输都会复杂一些。多数 Web 项目用 `TEXT` 存 UUID 已经足够。

#### 怎么选？

| 场景 | 推荐 |
| --- | --- |
| 本地应用、小型后台、单库写入 | `INTEGER PRIMARY KEY` |
| 内部表、关联表、日志表 | `INTEGER PRIMARY KEY` |
| 需要离线创建数据 | UUID |
| 多端同步或多库合并 | UUID |
| ID 会暴露在 URL/API 中且不希望被猜测 | UUID 或额外的 public id |

一个折中方案是同时保留两种 ID：

```sql
CREATE TABLE posts (
  id INTEGER PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL
);
```

内部关联和查询使用 `id`，对外暴露使用 `public_id`。

对应 Drizzle：

```ts
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  publicId: text('public_id')
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
})
```

这个方案在业务系统里很实用：

- 数据库内部仍然享受整数主键的简单和高效
- 外部 API 不暴露连续自增 ID
- 后续做同步或导入导出时，也有稳定的公开标识

## 总结

SQLite 的优势不在于“替代所有数据库”，而在于它把关系型数据库的能力压缩到了一个非常轻的形态里。

它适合：

- 本地优先的应用
- 小型服务
- CLI 和桌面软件
- 测试数据库
- 快速原型
- 边缘数据库生态

入门时要重点理解两件事：

1. SQLite 是嵌入式、单文件、零配置的 SQL 数据库
2. SQLite 的类型系统是动态类型 + 类型亲和性，不是传统强类型

如果你在 TypeScript 项目中使用 SQLite，Drizzle 是一个很自然的搭配：schema 写在 TypeScript 里，查询接近 SQL，同时还能获得类型推导和迁移能力。

小项目用 SQLite 可以很轻，大项目里用 SQLite 也可以很稳。关键是理解它的边界，别把它当成 PostgreSQL 的简化版，而要把它当成一个独立设计、极其务实的嵌入式数据库。

## 参考资料

- [SQLite About](https://sqlite.org/about.html)
- [SQLite Datatypes](https://www.sqlite.org/datatype3.html)
- [SQLite CREATE TABLE](https://www.sqlite.org/lang_createtable.html)
- [SQLite INSERT](https://sqlite.org/lang_insert.html)
- [SQLite Foreign Key Support](https://sqlite.org/foreignkeys.html)
- [SQLite Date And Time Functions](https://sqlite.org/lang_datefunc.html)
- [SQLite Autoincrement](https://sqlite.org/autoinc.html)
- [SQLite Rowid Tables](https://www.sqlite.org/rowidtable.html)
- [Drizzle SQLite Get Started](https://orm.drizzle.team/docs/get-started/sqlite-new)
- [Drizzle SQLite Column Types](https://orm.drizzle.team/docs/sqlite/column-types)
