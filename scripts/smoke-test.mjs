import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { cp, mkdir, mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { backup, DatabaseSync } from 'node:sqlite'
import { after, before, test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import { ContentRepository } from 'emdash'
import { createDialect } from 'emdash/db/sqlite'
import { Kysely } from 'kysely'
import { readSourcePosts } from './migrate-emdash.mjs'

let directory
let server
let origin
let db
let logs = ''
const sources = await readSourcePosts()
const published = sources.filter((post) => post.data.isPublish)
const drafts = sources.filter((post) => !post.data.isPublish)
const html = async (path) => {
  const response = await fetch(`${origin}${path}`)
  assert.equal(response.status, 200, path)
  return response.text()
}

before(async () => {
  directory = await mkdtemp(resolve(tmpdir(), 'langliu-emdash-test-'))
  await mkdir(resolve(directory, '.emdash'))
  const source = new DatabaseSync('.emdash/data.db')
  await backup(source, resolve(directory, '.emdash/data.db'))
  source.close()
  await cp('.emdash/uploads', resolve(directory, '.emdash/uploads'), { recursive: true })
  const portServer = createServer()
  await new Promise((done) => portServer.listen(0, '127.0.0.1', done))
  const { port } = portServer.address()
  await new Promise((done) => portServer.close(done))
  origin = `http://127.0.0.1:${port}`
  server = spawn(process.execPath, [resolve('dist/server/entry.mjs')], {
    cwd: directory,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  server.stdout.on('data', (data) => {
    logs += data
  })
  server.stderr.on('data', (data) => {
    logs += data
  })
  for (let count = 0; count < 100; count++) {
    try {
      if ((await fetch(origin)).status === 200) break
    } catch {}
    if (server.exitCode !== null) throw new Error(logs)
    if (count === 99) throw new Error(`服务未启动：${logs}`)
    await delay(100)
  }
  db = new Kysely({
    dialect: createDialect({ url: `file:${resolve(directory, '.emdash/data.db')}` }),
  })
})

after(async () => {
  if (db) await db.destroy()
  if (server && server.exitCode === null) {
    server.kill('SIGTERM')
    await new Promise((done) => server.once('exit', done))
  }
  if (directory) await rm(directory, { recursive: true, force: true })
})

test('全部文章标题、原始日期、目录锚点与静态资源可访问，草稿返回 404', async () => {
  for (const post of published) {
    const page = await html(`/posts/${post.data.slug}`)
    assert.ok(page.includes(post.data.title.replaceAll('&', '&amp;')), post.file)
    assert.ok(page.includes(new Date(post.data.publishedAt).toISOString()), post.file)
    for (const match of page.matchAll(/href="#([^"]+)"/g)) {
      assert.ok(page.includes(`id="${decodeURIComponent(match[1])}"`), `${post.file} #${match[1]}`)
    }
    for (const match of page.matchAll(/(?:src|href)="(\/(?:_astro|_emdash\/api\/media)[^"]+)"/g)) {
      assert.equal((await fetch(`${origin}${match[1]}`)).status, 200, match[1])
    }
    for (const match of page.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      const image = new URL(match[1].replaceAll('&amp;', '&'), origin)
      if (!/^\/(?:_image|_astro|_emdash\/api\/media)/.test(image.pathname)) continue
      assert.equal(
        (await fetch(`${origin}${image.pathname}${image.search}`)).status,
        200,
        image.href,
      )
    }
  }
  for (const post of sources.filter(({ data }) => data.cover && data.isPublish)) {
    const page = await html(`/posts/${post.data.slug}`)
    const image = page.match(/property="og:image" content="([^"]+)"/)?.[1]
    assert.ok(image, post.file)
    const imageUrl = new URL(image)
    assert.equal(
      (await fetch(`${origin}${imageUrl.pathname}${imageUrl.search}`)).status,
      200,
      image,
    )
  }
  for (const post of drafts)
    assert.equal((await fetch(`${origin}/posts/${post.data.slug}`)).status, 404)
})

test('RSS、sitemap 和列表完整覆盖已发布文章，排除草稿', async () => {
  const rss = await html('/rss.xml')
  const sitemap = await html('/sitemap-posts.xml')
  const list = await html('/posts')
  for (const post of published) {
    for (const page of [rss, sitemap, list])
      assert.ok(page.includes(`/posts/${post.data.slug}`), post.file)
  }
  for (const post of drafts) {
    for (const page of [rss, sitemap, list])
      assert.ok(!page.includes(`/posts/${post.data.slug}`), post.file)
  }
  assert.ok((await html('/sitemap.xml')).includes('/sitemap-posts.xml'))
  const legacy = await fetch(`${origin}/sitemap-index.xml`, { redirect: 'manual' })
  assert.equal(legacy.status, 301)
})

test('支持两字中文搜索、分类与标签筛选，未知路由返回 404', async () => {
  assert.ok(
    (await html('/search?q=%E9%97%AD%E5%8C%85')).includes('href="/posts/debounce-and-throttle"'),
  )
  const page = await html('/search?q=React&category=CSS')
  assert.ok(!page.includes('href="/posts/react-i18next"'))
  assert.equal((await fetch(`${origin}/categories/unknown`)).status, 404)
  assert.equal((await fetch(`${origin}/tags/unknown-tag`)).status, 404)
})

test('iframe、表格、代码高亮与复制脚本保留', async () => {
  const page = await html('/posts/react-i18next')
  assert.match(page, /<iframe[^>]+src="https:\/\/codesandbox.io\//)
  assert.match(page, /class="(?:astro-code|shiki)/)
  assert.match(await html('/posts/how-array-is-array'), /<table/)
})

test('真实文章的连续步骤与代码块保持在同一列表项内', async () => {
  const page = await html('/posts/claude-code-guide')
  const section = page.slice(page.indexOf('macOS 环境</h3>'), page.indexOf('Windows 环境</h3>'))
  assert.equal([...section.matchAll(/<ol(?:\s|>)/g)].length, 1)
  assert.equal([...section.matchAll(/<li(?:\s|>)/g)].length, 3)
  const items = [...section.matchAll(/<li(?:\s[^>]*)?>([\s\S]*?)<\/li>/g)]
  assert.match(items[0][1], /<pre[\s\S]*?<\/pre>/)
  assert.match(items[0][1].replace(/<[^>]+>/g, ''), /brew install claude-code/)
  assert.match(items[1][1], /<pre[\s\S]*?<\/pre>/)
  assert.match(items[1][1].replace(/<[^>]+>/g, ''), /npm install -g @anthropic-ai\/claude-code/)
})

test('后台写入后无需重建，页面、搜索和 RSS 立即更新', async () => {
  const repository = new ContentRepository(db)
  const post = await repository.findBySlug('posts', published[0].data.slug)
  const title = '更新测试中文关键词'
  await repository.update('posts', post.id, { data: { title } })
  assert.ok((await html(`/posts/${post.slug}`)).includes(title))
  assert.ok((await html('/search?q=%E6%9B%B4%E6%96%B0%E6%B5%8B%E8%AF%95')).includes(title))
  assert.ok((await html('/rss.xml')).includes(title))
})

test('生产环境启用后台认证，开发绕过接口不可用', async () => {
  const admin = await fetch(`${origin}/_emdash/admin`, { redirect: 'manual' })
  assert.equal(admin.status, 302)
  const write = await fetch(`${origin}/_emdash/api/content/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: {} }),
  })
  assert.ok([401, 403].includes(write.status))
  assert.ok(
    [403, 404].includes(
      (await fetch(`${origin}/_emdash/api/setup/dev-bypass`, { redirect: 'manual' })).status,
    ),
  )
})

test('后台 SEO 标题、摘要、canonical 和 noindex 在文章页面生效', async () => {
  const repository = new ContentRepository(db)
  const post = await repository.findBySlug('posts', published[1].data.slug)
  await db
    .insertInto('_emdash_seo')
    .values({
      collection: 'posts',
      content_id: post.id,
      seo_title: '后台 SEO 标题',
      seo_description: '后台 SEO 摘要',
      seo_canonical: 'https://example.com/canonical',
      seo_no_index: 1,
    })
    .execute()
  const page = await html(`/posts/${post.slug}`)
  assert.ok(page.includes('<title>后台 SEO 标题</title>'))
  assert.ok(page.includes('name="description" content="后台 SEO 摘要"'))
  assert.ok(page.includes('rel="canonical" href="https://example.com/canonical"'))
  assert.match(page, /name="robots" content="noindex/)
})
