import assert from 'node:assert/strict'
import { access, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { SITE_URL } from '../src/data/config.ts'

const root = fileURLToPath(new URL('../', import.meta.url))
const dist = path.join(root, 'dist')
const site = SITE_URL
const normalize = (url) => decodeURIComponent(new URL(url, site).pathname).replace(/\/$/, '') || '/'
const read = (file) => readFile(path.join(dist, file), 'utf8')
const decode = (text) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value, 16)))
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
const textContent = (html) => decode(html.replace(/<[^>]*>/g, ''))
const compact = (text) => text.replace(/[\s\u200b]/g, '')
const values = (xml, tag) =>
  [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map((match) =>
    decode(match[1]),
  )

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name)
      return entry.isDirectory() ? walk(file) : [file]
    }),
  )
  return files.flat()
}

// 和 content:lint 一样，只接受本仓库当前使用的单行 frontmatter 字段。
const posts = await Promise.all(
  (await walk(path.join(root, 'posts')))
    .filter((file) => /^[^_].*\.mdx?$/.test(path.basename(file)))
    .map(async (file) => {
      const raw = await readFile(file, 'utf8')
      const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
      assert.ok(frontmatter, `${file}: 缺少 frontmatter`)
      const field = (name) => {
        const value = frontmatter.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1]?.trim()
        assert.ok(value && !/^[>|]/.test(value), `${file}: ${name} 必须是单行字段`)
        return value.replace(/^(['"])(.*)\1$/, '$2')
      }
      const published = field('isPublish')
      assert.match(published, /^(true|false)$/, `${file}: isPublish`)
      return {
        title: field('title'),
        slug: field('slug'),
        category: field('category'),
        published: published === 'true',
        route: `/posts/${field('slug')}`,
      }
    }),
)
const published = posts.filter((post) => post.published)
const drafts = posts.filter((post) => !post.published)
const expectedRoutes = published.map((post) => post.route).sort()
assert.ok(published.length, '至少需要一篇已发布文章')
assert.equal(new Set(posts.map((post) => post.slug)).size, posts.length, '文章 slug 不得重复')

test('构建文章路由、标题和草稿隔离', async () => {
  const actualRoutes = (await walk(path.join(dist, 'posts')))
    .filter((file) => file.endsWith('.html'))
    .map((file) => normalize(path.relative(dist, file).replace(/index\.html$/, '')))
    .filter((route) => route !== '/posts')
    .sort()
  assert.deepEqual(actualRoutes, expectedRoutes, '文章输出必须恰好等于已发布文章')
  for (const post of published) {
    const html = await read(`posts/${post.slug}/index.html`)
    // 正文可能含历史文章自己的 h1，只验证模板提供的文章标题。
    const template = html.replace(/<article\b[^>]*>[\s\S]*?<\/article>/g, '')
    const headings = [...template.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)]
    assert.equal(headings.length, 1, `${post.route}: 模板需要唯一文章标题`)
    assert.equal(textContent(headings[0][1]).trim(), post.title, `${post.route}: 标题`)
    assert.match(headings[0][0], /data-pagefind-body/, `${post.route}: 标题必须参与搜索`)
  }
  for (const post of drafts) {
    await assert.rejects(access(path.join(dist, `posts/${post.slug}/index.html`)), {
      code: 'ENOENT',
    })
  }
})

test('长文章目录阈值和锚点有效', async () => {
  for (const post of published) {
    const html = await read(`posts/${post.slug}/index.html`)
    const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? ''
    const headings = [...article.matchAll(/<h[23]\b[^>]*\bid="([^"]+)"/g)]
    const toc = html.match(/<aside class="post-toc"[^>]*>([\s\S]*?)<\/aside>/)?.[1]
    assert.equal(Boolean(toc), headings.length >= 3, `${post.route}: 目录显示阈值`)
    if (!toc) continue
    const targets = headings.map((heading) => decode(heading[1]))
    const links = [...toc.matchAll(/href="#([^"]+)"/g)].map((link) =>
      decodeURIComponent(decode(link[1])),
    )
    assert.deepEqual(links, [...targets, ...targets], `${post.route}: 桌面与移动目录锚点`)
  }
})

test('RSS 和 sitemap 完整覆盖文章且不泄漏草稿', async () => {
  const rss = await read('rss.xml')
  const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  const rssRoutes = items.map((item) => {
    const links = values(item[1], 'link')
    assert.equal(links.length, 1, 'RSS item 必须有一个 link')
    assert.equal(new URL(links[0]).origin, new URL(site).origin)
    return normalize(links[0])
  })
  assert.deepEqual(rssRoutes.sort(), expectedRoutes, 'RSS 文章集合')
  for (const post of published) {
    const item = items.find((entry) => normalize(values(entry[1], 'link')[0]) === post.route)
    assert.deepEqual(values(item[1], 'title'), [post.title], `${post.route}: RSS 标题`)
    assert.ok(Number.isFinite(Date.parse(values(item[1], 'pubDate')[0])), 'RSS 发布时间')
  }

  const maps = values(await read('sitemap-index.xml'), 'loc')
  assert.ok(maps.length, 'sitemap index 不能为空')
  const sitemapRoutes = []
  for (const map of maps) {
    assert.equal(new URL(map).origin, new URL(site).origin)
    for (const location of values(await read(new URL(map).pathname.slice(1)), 'loc')) {
      assert.equal(new URL(location).origin, new URL(site).origin)
      sitemapRoutes.push(normalize(location))
    }
  }
  assert.deepEqual(
    sitemapRoutes.filter((route) => route.startsWith('/posts/')).sort(),
    expectedRoutes,
    'sitemap 文章集合',
  )
  for (const route of sitemapRoutes) {
    await assertTargetExists(route, 'sitemap')
  }
})

async function assertTargetExists(route, source) {
  const relative = route.replace(/^\//, '')
  const candidates = [relative, `${relative}/index.html`]
  for (const candidate of candidates) {
    try {
      const files = await readFile(path.join(dist, candidate))
      if (files.length > 0) return
    } catch (error) {
      if (!['ENOENT', 'EISDIR'].includes(error.code)) throw error
    }
  }
  assert.fail(`${source}: 站内链接无输出文件 ${route}`)
}

test('站点导航和文章中的博客路由链接有效', async () => {
  for (const file of (await walk(dist)).filter((file) => file.endsWith('.html'))) {
    if (file.includes(`${path.sep}pagefind${path.sep}`)) continue
    const source = path.relative(dist, file)
    const base = new URL(source.replace(/index\.html$/, ''), site)
    const html = await readFile(file, 'utf8')
    const articles = [...html.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)]
    const navigation = html.replace(/<article\b[^>]*>[\s\S]*?<\/article>/g, '')
    const sections = [
      { html: navigation, article: false },
      ...articles.map((article) => ({ html: article[1], article: true })),
    ]
    for (const section of sections) {
      // 跳过脚本、注释和转义后的代码示例，不尝试用正则解析任意 HTML。
      const markup = section.html.replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>/g, '')
      for (const match of markup.matchAll(/<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')/g)) {
        const href = decode(match[1] ?? match[2])
        const url = new URL(href, base)
        if (url.origin !== new URL(site).origin) continue
        const route = normalize(url.href)
        // 正文中的 /login、/about 等是教学示例；博客自己的路由不豁免。
        if (section.article && !/^\/(?:posts|tags|categories)(?:\/|$)/.test(route)) continue
        await assertTargetExists(route, source)
      }
    }
  }
})

test('Pagefind 实际索引、分类过滤和标题中文搜索', { timeout: 30000 }, async () => {
  const originalFetch = globalThis.fetch
  const indexRoot = path.join(dist, 'pagefind')
  let pagefind
  try {
    // 包的 Node API 只能建索引；直接加载构建的搜索运行时，文件适配器不允许联网。
    globalThis.fetch = async (input) => {
      const url = new URL(input)
      assert.equal(url.protocol, 'file:', `不允许访问网络: ${url}`)
      const file = fileURLToPath(url)
      assert.ok(file.startsWith(`${indexRoot}${path.sep}`), `越界读取: ${file}`)
      return new Response(await readFile(file))
    }
    pagefind = await import(pathToFileURL(path.join(indexRoot, 'pagefind.js')).href)
    await pagefind.options({ language: 'zh-cn', baseUrl: '/' })
    const all = await pagefind.search(null)
    const entries = await Promise.all(all.results.map((result) => result.data()))
    assert.deepEqual(entries.map((entry) => normalize(entry.url)).sort(), expectedRoutes)
    for (const post of published) {
      const entry = entries.find((result) => normalize(result.url) === post.route)
      assert.equal(entry.meta.title, post.title, `${post.route}: 索引标题`)
      assert.ok(
        compact(entry.content).includes(compact(post.title)),
        `${post.route}: 标题不仅是 metadata`,
      )
    }
    for (const category of new Set(published.map((post) => post.category))) {
      const response = await pagefind.search(null, { filters: { 分类: category } })
      const results = await Promise.all(response.results.map((result) => result.data()))
      assert.deepEqual(
        results.map((entry) => normalize(entry.url)).sort(),
        published
          .filter((post) => post.category === category)
          .map((post) => post.route)
          .sort(),
        `分类过滤: ${category}`,
      )
    }

    // 选择正文中不存在的中文标题词，避免“正文碰巧命中”掩盖标题未被索引。
    const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
    let titleOnlyChecks = 0
    for (const post of published) {
      const html = await read(`posts/${post.slug}/index.html`)
      const body = textContent(html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? '')
      const words = [...segmenter.segment(post.title)]
        .filter((part) => part.isWordLike && /^[\p{Script=Han}]{2,}$/u.test(part.segment))
        .map((part) => part.segment)
      const keyword = words.find((word) => !body.includes(word))
      if (!keyword) continue
      const response = await pagefind.search(keyword)
      const results = await Promise.all(response.results.map((result) => result.data()))
      assert.ok(
        results.some((entry) => normalize(entry.url) === post.route),
        `${post.route}: 标题中文词 "${keyword}" 应可搜索`,
      )
      titleOnlyChecks += 1
    }
    assert.ok(titleOnlyChecks > 0, '至少需要一个正文未出现的中文标题关键词样本')
    console.log(
      `索引验证：${entries.length} 篇文章，${drafts.length} 篇草稿，${titleOnlyChecks} 个标题词`,
    )
  } finally {
    await pagefind?.destroy()
    globalThis.fetch = originalFetch
  }
})
