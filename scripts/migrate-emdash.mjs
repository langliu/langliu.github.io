import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import { htmlToPortableText } from '@emdash-cms/gutenberg-to-portable-text'
import {
  ContentRepository,
  handleMediaUsageRepair,
  MediaRepository,
  RevisionRepository,
} from 'emdash'
import { createDialect } from 'emdash/db/sqlite'
import { applySeed, validateSeed } from 'emdash/seed'
import { LocalStorage } from 'emdash/storage/local'
import matter from 'gray-matter'
import { Kysely } from 'kysely'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import sharp from 'sharp'
import { unified } from 'unified'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const parser = unified().use(remarkParse).use(remarkGfm)
const htmlProcessor = unified()
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true })

/** 将 Markdown AST 转为可在后台继续编辑的 Portable Text，保留嵌套列表和代码语言。 */
export function convertMarkdown(markdown, resolveImage = (url) => ({ url })) {
  const source = markdown.replace(/<aside>\s*([\s\S]*?)\s*<\/aside>/g, (_, text) =>
    text
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n'),
  )
  const tree = parser.parse(source)
  const definitions = tree.children.filter((node) => node.type === 'definition')
  let counter = 0
  const key = () => `block-${counter++}`
  const toHtml = (node) =>
    htmlProcessor.stringify(
      htmlProcessor.runSync({
        type: 'root',
        children: [node, ...definitions],
      }),
    )
  const inline = (node) => htmlToPortableText(toHtml(node), { keyGenerator: key })
  function convert(nodes, level = 0) {
    return nodes.flatMap((node) => {
      if (node.type === 'definition') return []
      if (node.type === 'code')
        return [{ _type: 'code', _key: key(), code: node.value, language: node.lang ?? 'text' }]
      if (node.type === 'list') {
        const listId = `list-${node.position.start.offset}`
        return node.children.flatMap((item, index) => {
          const blocks = convert(item.children, level + 1)
          let first = blocks.find((block) => block._type === 'block' && !block.listItem)
          if (!first) {
            first = { _type: 'block', _key: key(), style: 'normal', children: [], markDefs: [] }
            blocks.unshift(first)
          }
          if (first) {
            first.listItem = node.ordered ? 'number' : 'bullet'
            first.level = level + 1
            if (node.ordered) {
              first.listId = listId
              first.listStart = node.start ?? 1
            }
            if (node.ordered && index === 0 && node.start > 1) first.start = node.start
            if (item.checked !== null && item.checked !== undefined) {
              first.children.unshift({
                _type: 'span',
                _key: key(),
                text: item.checked ? '☑ ' : '☐ ',
                marks: [],
              })
            }
          }
          // EmDash 编辑器保留 _key；用它关联同一项的后续段落与代码块。
          for (const block of blocks) {
            if (block === first || block.listItem || block._key.startsWith('list-child:')) continue
            block._key = `list-child:${encodeURIComponent(first._key)}:${block._key}`
          }
          return blocks
        })
      }
      if (node.type === 'blockquote') {
        return convert(node.children, level).map((block) =>
          block._type === 'block' ? { ...block, style: 'blockquote' } : block,
        )
      }
      if (node.type === 'html') {
        if (/^\s*<iframe\b/i.test(node.value)) {
          const attr = (name) => node.value.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'))?.[1]
          const src = attr('src')
          if (!src?.startsWith('https://')) throw new Error('iframe 必须使用 HTTPS')
          return [
            { _type: 'iframe', _key: key(), src, title: attr('title') ?? '交互示例', height: 500 },
          ]
        }
        return [{ _type: 'htmlBlock', _key: key(), html: node.value }]
      }
      if (['paragraph', 'heading', 'table', 'thematicBreak'].includes(node.type))
        return inline(node)
      throw new Error(`尚未支持的 Markdown 节点：${node.type}`)
    })
  }
  const blocks = convert(tree.children)
  function rewrite(value) {
    if (Array.isArray(value)) return value.forEach(rewrite)
    if (!value || typeof value !== 'object') return
    if (value._type === 'image') {
      const image = resolveImage(value.asset.url ?? value.asset._ref)
      value.asset = { _ref: image.id ?? image.url, url: image.url }
      if (image.width) value.width = image.width
      if (image.height) value.height = image.height
    }
    if (value._type === 'link' && /^https?:\/\//.test(value.href ?? '')) value.blank = true
    Object.values(value).forEach(rewrite)
  }
  rewrite(blocks)
  return blocks
}

/** 仅修复与旧导入正文完全一致的记录，后台编辑过的正文保持不变。 */
export function repairListContent(current, converted) {
  if (!Array.isArray(current)) return null
  const legacy = converted.map(({ listId: _listId, listStart: _listStart, ...block }) => ({
    ...block,
    _key: block._key.replace(/^list-child:[^:]+:/, ''),
  }))
  return isDeepStrictEqual(JSON.parse(JSON.stringify(current)), JSON.parse(JSON.stringify(legacy)))
    ? converted
    : null
}

export async function repairImportedListPost(db, entry) {
  if (!entry.data.content.some((block) => block._key.startsWith('list-child:'))) return false
  return db.transaction().execute(async (transaction) => {
    const content = new ContentRepository(transaction)
    const existing = await content.findBySlug('posts', entry.slug)
    if (!existing || existing.draftRevisionId || existing.status !== 'published') return false
    const updated = repairListContent(existing.data.content, entry.data.content)
    if (!updated || isDeepStrictEqual(updated, existing.data.content)) return false

    const revisions = new RevisionRepository(transaction)
    const live = existing.liveRevisionId ? await revisions.findById(existing.liveRevisionId) : null
    if (live && !isDeepStrictEqual(live.data.content, existing.data.content)) return false
    const revision = await revisions.create({
      collection: 'posts',
      entryId: existing.id,
      data: { ...live?.data, ...existing.data, content: updated },
      authorId: existing.authorId ?? undefined,
    })
    await content.update('posts', existing.id, { data: { content: updated } })
    await transaction
      .updateTable('ec_posts')
      .set({ live_revision_id: revision.id })
      .where('id', '=', existing.id)
      .execute()
    return true
  })
}

export async function readSourcePosts() {
  const files = (await readdir(resolve(ROOT, 'posts')))
    .filter((file) => /\.mdx?$/.test(file))
    .sort()
  return Promise.all(
    files.map(async (file) => {
      const { data, content } = matter(await readFile(resolve(ROOT, 'posts', file), 'utf8'))
      return { file, data, markdown: content }
    }),
  )
}

async function createLocalImporter(seed) {
  await mkdir(resolve(ROOT, '.emdash'), { recursive: true })
  execFileSync(
    process.execPath,
    [
      resolve(ROOT, 'node_modules/emdash/dist/cli/index.mjs'),
      'seed',
      'seed/seed.json',
      '--database',
      '.emdash/data.db',
      '--no-content',
    ],
    { cwd: ROOT, stdio: 'inherit' },
  )
  const db = new Kysely({
    dialect: createDialect({ url: `file:${resolve(ROOT, '.emdash/data.db')}` }),
  })
  const media = new MediaRepository(db)
  const storage = new LocalStorage({
    directory: resolve(ROOT, '.emdash/uploads'),
    baseUrl: '/_emdash/api/media/file',
  })
  return {
    async upload(file, bytes, dimensions) {
      const hash = `sha1:${createHash('sha1').update(bytes).digest('hex')}`
      let item = await media.findByContentHash(hash)
      if (!item) {
        const storageKey = `migration/${basename(file)}`
        await storage.upload({ key: storageKey, body: bytes, contentType: 'image/webp' })
        item = await media.create({
          filename: basename(file),
          storageKey,
          mimeType: 'image/webp',
          size: bytes.length,
          width: dimensions.width,
          height: dimensions.height,
          contentHash: hash,
          status: 'ready',
        })
      }
      return {
        id: item.id,
        url: storage.getPublicUrl(item.storageKey),
        width: item.width,
        height: item.height,
      }
    },
    async import(entries) {
      let repaired = 0
      for (const entry of entries) {
        if (await repairImportedListPost(db, entry)) repaired++
      }
      const result = await applySeed(
        db,
        { ...seed, content: { posts: entries } },
        {
          includeContent: true,
          onConflict: 'skip',
          storage,
        },
      )
      console.log(`文章：新增 ${result.content.created}，跳过 ${result.content.skipped}`)
      if (repaired) console.log(`修复未编辑的导入正文：${repaired}`)
      const usage = await handleMediaUsageRepair(db, { scope: 'collection', collection: 'posts' })
      if (!usage.success || usage.data.status !== 'complete') {
        throw new Error(`媒体引用索引修复失败：${usage.error?.message ?? usage.data?.status}`)
      }
    },
    close: () => db.destroy(),
  }
}

export async function createRemoteImporter(origin, receiptDirectory = resolve(ROOT, '.emdash')) {
  const url = new URL(origin)
  if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
    throw new Error('远程迁移必须使用 HTTPS')
  }
  const token = process.env.EMDASH_TOKEN
  if (!token) throw new Error('请通过 EMDASH_TOKEN 环境变量提供管理员访问令牌')
  await mkdir(receiptDirectory, { recursive: true })
  const receiptPath = resolve(
    receiptDirectory,
    `remote-import-${createHash('sha256').update(url.origin).digest('hex').slice(0, 16)}.json`,
  )
  let pending = {}
  try {
    pending = JSON.parse(await readFile(receiptPath, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const saveReceipt = () => writeFile(receiptPath, JSON.stringify(pending), { mode: 0o600 })
  async function request(path, method = 'GET', body) {
    const response = await fetch(new URL(`/_emdash/api/${path}`, url), {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      redirect: 'error',
    })
    const result = await response.json()
    if (!response.ok || !result.success)
      throw new Error(`${method} ${path}: ${result.error?.message ?? response.status}`)
    return result.data
  }
  return {
    async upload(file, bytes) {
      const form = new FormData()
      form.append('file', new Blob([bytes], { type: 'image/webp' }), basename(file))
      const { item } = await request('media', 'POST', form)
      return {
        id: item.id,
        url: item.url ?? `/_emdash/api/media/file/${item.id}`,
        width: item.width,
        height: item.height,
      }
    },
    async import(entries) {
      const existing = new Set()
      let cursor
      do {
        const params = new URLSearchParams({ limit: '100' })
        if (cursor) params.set('cursor', cursor)
        const result = await request(`content/posts?${params}`)
        for (const item of result.items) existing.add(item.slug)
        cursor = result.nextCursor
      } while (cursor)
      let created = 0
      for (const entry of entries) {
        if (pending[entry.slug]) {
          await request(`content/posts/${pending[entry.slug]}/publish`, 'POST')
          delete pending[entry.slug]
          await saveReceipt()
          continue
        }
        if (existing.has(entry.slug)) continue
        const { item } = await request('content/posts', 'POST', {
          slug: entry.slug,
          data: entry.data,
          publishedAt: entry.data.published_date,
        })
        if (entry.status === 'published') {
          pending[entry.slug] = item.id
          await saveReceipt()
          await request(`content/posts/${item.id}/publish`, 'POST')
          delete pending[entry.slug]
          await saveReceipt()
        }
        created++
      }
      console.log(`文章：新增 ${created}，跳过 ${entries.length - created}`)
    },
    close: async () => {},
  }
}

async function main() {
  const seed = JSON.parse(await readFile(resolve(ROOT, 'seed/seed.json'), 'utf8'))
  const validation = validateSeed(seed)
  if (!validation.valid) throw new Error(validation.errors.join('\n'))
  const remoteIndex = process.argv.indexOf('--remote')
  if (remoteIndex !== -1 && !process.argv[remoteIndex + 1]) throw new Error('--remote 需要站点地址')
  const importer =
    remoteIndex === -1
      ? await createLocalImporter(seed)
      : await createRemoteImporter(process.argv[remoteIndex + 1])
  try {
    const sources = await readSourcePosts()
    const slugs = sources.map(({ data }) => data.slug)
    if (new Set(slugs).size !== slugs.length) throw new Error('源文章存在重复 slug')
    const images = new Map()
    for (const file of (await readdir(resolve(ROOT, 'src/assets/posts'))).sort()) {
      const bytes = await readFile(resolve(ROOT, 'src/assets/posts', file))
      const dimensions = await sharp(bytes).metadata()
      images.set(file, await importer.upload(file, bytes, dimensions))
    }
    const resolveImage = (url) => {
      if (typeof url === 'string' && /^(?:\.\.\/src\/|src\/)?assets\/posts\//.test(url)) {
        const image = images.get(basename(url))
        if (!image) throw new Error(`本地图片不存在：${url}`)
        return image
      }
      return { url }
    }
    const entries = sources.map(({ data, markdown }) => ({
      id: data.slug,
      slug: data.slug,
      status: data.isPublish ? 'published' : 'draft',
      data: {
        title: data.title,
        description: data.description,
        published_date: new Date(data.publishedAt).toISOString(),
        ...(data.updatedAt ? { updated_date: new Date(data.updatedAt).toISOString() } : {}),
        category: data.category,
        tags: data.tags ?? [],
        ...(data.cover
          ? {
              cover: {
                ...resolveImage(data.cover),
                src: resolveImage(data.cover).url,
                provider: 'local',
              },
            }
          : {}),
        content: convertMarkdown(markdown, resolveImage),
      },
    }))
    const result = validateSeed({ ...seed, content: { posts: entries } })
    if (!result.valid) throw new Error(result.errors.join('\n'))
    await importer.import(entries)
    console.log(
      `媒体 ${images.size} 张；已发布 ${entries.filter((entry) => entry.status === 'published').length} 篇，草稿 ${entries.filter((entry) => entry.status === 'draft').length} 篇`,
    )
  } finally {
    await importer.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
