import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { backup, DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import {
  ContentRepository,
  portableTextToProsemirror,
  prosemirrorToPortableText,
  RevisionRepository,
} from 'emdash'
import { createDialect } from 'emdash/db/sqlite'
import { Kysely } from 'kysely'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { preparePostContent } from '../src/utils/portableText.ts'
import {
  convertMarkdown,
  createRemoteImporter,
  readSourcePosts,
  repairImportedListPost,
  repairListContent,
} from './migrate-emdash.mjs'

const text = (value) => {
  if (Array.isArray(value)) return value.map(text).join('')
  if (!value || typeof value !== 'object') return ''
  if (typeof value.text === 'string') return value.text
  if (typeof value.code === 'string') return value.code
  return text(value.children ?? value.content ?? value.rows ?? value.cells)
}

test('保留代码语言、原始代码、嵌套列表、表格和链接', () => {
  const content = convertMarkdown(
    '# 标题\n\n1. 父项\n   - **子项**\n\n```ts\nconst x = "<script>"\n```\n\n| 列 | 值 |\n| --- | --- |\n| [链接](https://example.com) | `代码` |',
  )
  assert.equal(content[0].style, 'h1')
  const lists = content.filter((block) => block.listItem)
  assert.deepEqual(
    lists.map((block) => [block.listItem, block.level]),
    [
      ['number', 1],
      ['bullet', 2],
    ],
  )
  const code = content.find((block) => block._type === 'code')
  assert.equal(code.language, 'ts')
  assert.equal(code.code, 'const x = "<script>"')
  const table = content.find((block) => block._type === 'table')
  assert.ok(table)
  assert.match(text(table), /链接代码/)
  assert.ok(JSON.stringify(table).includes('https://example.com'))
})

test('迁移图片引用、iframe 和提示块', () => {
  const content = convertMarkdown(
    '![说明](../src/assets/posts/test.webp)\n\n<iframe src="https://codesandbox.io/embed/example" title="示例"></iframe>\n\n<aside>\n注意事项\n</aside>',
    () => ({ id: 'media-id', url: '/media/test.webp', width: 400, height: 300 }),
  )
  const image = content.find((block) => block._type === 'image')
  assert.equal(image.asset._ref, 'media-id')
  assert.equal(image.asset.url, '/media/test.webp')
  assert.equal(image.alt, '说明')
  assert.equal(image.width, 400)
  assert.equal(content.find((block) => block._type === 'iframe').title, '示例')
  assert.equal(content.find((block) => block.style === 'blockquote').children[0].text, '注意事项')
})

test('带代码与后续段落的步骤保持同一个列表，并在后台编辑往返后保留归属', () => {
  const markdown =
    '3. 第三步\n\n   ```ts\n   const x = 1\n   ```\n\n   说明\n\n4. 第四步\n   - 子项\n\n   ```sh\n   echo done\n   ```\n\n5. 第五步'
  const converted = convertMarkdown(markdown)
  for (const content of [
    converted,
    prosemirrorToPortableText(portableTextToProsemirror(converted, { preserveIdentity: true })),
  ]) {
    const [list] = preparePostContent(content).content
    assert.equal(list._type, 'postList')
    assert.equal(list.start, 3)
    assert.equal(list.items.length, 3)
    assert.deepEqual(
      list.items[0].content.map((block) => block._type),
      ['block', 'code', 'block'],
    )
    assert.equal(list.items[0].content[1].code, 'const x = 1')
    assert.deepEqual(
      list.items[1].content.map((block) => block._type),
      ['block', 'postList', 'code'],
    )
    assert.equal(list.items[1].content[1].listItem, 'bullet')
    assert.equal(list.items[1].content[2].code, 'echo done')
  }
})

test('修复旧导入的列表时保留后台修改', () => {
  const converted = convertMarkdown('1. 第一步\n\n   ```sh\n   echo one\n   ```\n\n2. 第二步')
  const legacy = converted.map(({ listId: _id, listStart: _start, ...block }) => ({
    ...block,
    _key: block._key.replace(/^list-child:[^:]+:/, ''),
  }))
  assert.deepEqual(repairListContent(legacy, converted), converted)
  const edited = structuredClone(legacy)
  edited[1].code = 'echo edited'
  assert.equal(repairListContent(edited, converted), null)
})

test('后台新增的普通代码块打断列表时，编号仍按列表标识继续', () => {
  const content = convertMarkdown('3. 第三步\n4. 第四步')
  content.splice(1, 0, { _type: 'code', _key: 'editor-code', code: 'example' })
  assert.deepEqual(
    preparePostContent(content).content.map((block) => block.start),
    [3, undefined, 4],
  )
})

test('旧正文修复同步当前版本，保留历史版本与后台未发布的修改', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'emdash-repair-test-'))
  const path = join(directory, 'data.db')
  const source = new DatabaseSync('.emdash/data.db')
  await backup(source, path)
  source.close()
  const db = new Kysely({ dialect: createDialect({ url: `file:${path}` }) })
  try {
    const repository = new ContentRepository(db)
    const revisions = new RevisionRepository(db)
    const converted = convertMarkdown('1. 第一步\n\n   ```sh\n   echo one\n   ```\n\n2. 第二步')
    const legacy = converted.map(({ listId: _id, listStart: _start, ...block }) => ({
      ...block,
      _key: block._key.replace(/^list-child:[^:]+:/, ''),
    }))
    const data = {
      title: '步骤修复测试',
      description: '测试',
      category: '其他',
      tags: ['Tools'],
      published_date: '2024-01-01T00:00:00.000Z',
      content: legacy,
    }
    const created = await repository.create({ type: 'posts', slug: 'test-list-repair', data })
    const original = await repository.publish('posts', created.id)
    const entry = { slug: original.slug, data: { content: converted } }
    assert.equal(await repairImportedListPost(db, entry), true)
    const repaired = await repository.findById('posts', created.id)
    assert.equal(repaired.publishedAt, original.publishedAt)
    assert.equal(repaired.status, 'published')
    assert.notEqual(repaired.liveRevisionId, original.liveRevisionId)
    assert.deepEqual(
      (await revisions.findById(repaired.liveRevisionId)).data.content,
      repaired.data.content,
    )
    assert.deepEqual(
      (await revisions.findById(original.liveRevisionId)).data.content,
      original.data.content,
    )
    assert.equal(await repairImportedListPost(db, entry), false)

    const draft = await repository.create({ type: 'posts', slug: 'test-list-pending-draft', data })
    await repository.publish('posts', draft.id)
    const edited = await repository.updateDraftAware('posts', draft.id, {
      data: { title: '后台的新标题' },
    })
    assert.ok(edited.draftRevisionId)
    assert.equal(
      await repairImportedListPost(db, { slug: draft.slug, data: { content: converted } }),
      false,
    )
    assert.equal(
      (await repository.findById('posts', draft.id)).draftRevisionId,
      edited.draftRevisionId,
    )
  } finally {
    await db.destroy()
    await rm(directory, { recursive: true, force: true })
  }
})

test('所有源文章均可转换，不丢失代码块且键值唯一', async () => {
  const posts = await readSourcePosts()
  assert.equal(posts.length, 39)
  assert.equal(posts.filter((post) => post.data.isPublish).length, 37)
  for (const post of posts) {
    const blocks = convertMarkdown(post.markdown)
    assert.ok(blocks.length, post.file)
    assert.equal(new Set(blocks.map((block) => block._key)).size, blocks.length, post.file)
    const fences = []
    const visit = (node) => {
      if (node.type === 'code') fences.push(node.value)
      node.children?.forEach(visit)
    }
    visit(unified().use(remarkParse).parse(post.markdown))
    const codes = blocks.filter((block) => block._type === 'code').map((block) => block.code)
    assert.deepEqual(codes, fences, `代码块：${post.file}`)
  }
})

test('远程发布中断可恢复，重跑不会覆盖已有文章或发布已有草稿', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'emdash-import-test-'))
  const previousToken = process.env.EMDASH_TOKEN
  process.env.EMDASH_TOKEN = 'test-only-token'
  const items = [{ id: 'existing', slug: 'old-draft', status: 'draft' }]
  const publishedIds = []
  let failPublish = true
  const server = createServer(async (request, response) => {
    assert.equal(request.headers.authorization, 'Bearer test-only-token')
    let result
    if (request.method === 'GET') result = { items }
    else if (request.url.endsWith('/publish')) {
      if (failPublish) {
        failPublish = false
        response.writeHead(503, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ success: false, error: { message: 'temporary failure' } }))
        return
      }
      publishedIds.push(request.url.split('/').at(-2))
      result = {}
    } else {
      let body = ''
      for await (const chunk of request) body += chunk
      const entry = JSON.parse(body)
      const item = { id: 'new-id', slug: entry.slug }
      items.push(item)
      result = { item }
    }
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ success: true, data: result }))
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  try {
    const origin = `http://127.0.0.1:${server.address().port}`
    const entries = ['old-draft', 'new-post'].map((slug) => ({
      slug,
      status: 'published',
      data: { published_date: '2024-01-01T00:00:00.000Z' },
    }))
    const first = await createRemoteImporter(origin, directory)
    await assert.rejects(first.import(entries), /temporary failure/)
    const retry = await createRemoteImporter(origin, directory)
    await retry.import(entries)
    await retry.import(entries)
    assert.deepEqual(publishedIds, ['new-id'])
    assert.equal(items.length, 2)
  } finally {
    if (previousToken === undefined) delete process.env.EMDASH_TOKEN
    else process.env.EMDASH_TOKEN = previousToken
    await new Promise((done) => server.close(done))
    await rm(directory, { recursive: true, force: true })
  }
})
