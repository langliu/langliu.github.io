import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const POSTS_DIR = path.resolve('posts')
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const errors = []

function fail(file, message) {
  errors.push(`${file}: ${message}`)
}

function getFrontmatter(raw) {
  if (!raw.startsWith('---')) {
    return null
  }

  const end = raw.indexOf('\n---', 3)
  if (end === -1) {
    return null
  }

  return raw.slice(4, end)
}

function getField(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'))
  return match?.[1]?.trim() ?? null
}

function parseTags(frontmatter) {
  const lines = frontmatter.split('\n')
  const tags = []

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^tags:\s*$/.test(lines[index]) && !/^tags:\s*\[/.test(lines[index])) {
      continue
    }

    if (lines[index].includes('[')) {
      const inline = lines[index].replace(/^tags:\s*/, '').trim()
      if (inline === '[]' || inline === 'null') {
        return tags
      }
    }

    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const line = lines[cursor]
      if (!/^\s*-\s+/.test(line)) {
        break
      }
      tags.push(
        line
          .replace(/^\s*-\s+/, '')
          .trim()
          .replace(/^['"]|['"]$/g, ''),
      )
    }
    break
  }

  return tags
}

const files = (await readdir(POSTS_DIR))
  .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
  .sort()

const slugToFile = new Map()

for (const file of files) {
  const fullPath = path.join(POSTS_DIR, file)
  const raw = await readFile(fullPath, 'utf8')
  const frontmatter = getFrontmatter(raw)

  if (!frontmatter) {
    fail(file, '缺少合法 frontmatter')
    continue
  }

  const title = getField(frontmatter, 'title')
  const description = getField(frontmatter, 'description')
  const slug = getField(frontmatter, 'slug')?.replace(/^['"]|['"]$/g, '')
  const category = getField(frontmatter, 'category')?.replace(/^['"]|['"]$/g, '')
  const isPublish = getField(frontmatter, 'isPublish')
  const tags = parseTags(frontmatter)

  if (!title) fail(file, '缺少 title')
  if (!description) fail(file, '缺少 description')
  if (!slug) {
    fail(file, '缺少 slug')
  } else if (!SLUG_PATTERN.test(slug)) {
    fail(file, `slug 非法: ${slug}`)
  } else if (slugToFile.has(slug)) {
    fail(file, `slug 与 ${slugToFile.get(slug)} 重复: ${slug}`)
  } else {
    slugToFile.set(slug, file)
  }

  if (!category) fail(file, '缺少 category')
  if (isPublish !== 'true' && isPublish !== 'false') {
    fail(file, 'isPublish 必须是 true/false')
  }

  if (description && title) {
    const normalizedDescription = description.replace(/^['"]|['"]$/g, '')
    const normalizedTitle = title.replace(/^['"]|['"]$/g, '')
    if (
      normalizedDescription.includes('7-Zip') &&
      !normalizedTitle.toLowerCase().includes('7-zip') &&
      !normalizedTitle.includes('7-Zip')
    ) {
      fail(file, 'description 疑似从其他文章复制')
    }
  }

  if (isPublish === 'true' && tags.length === 0) {
    fail(file, '已发布文章缺少 tags')
  }

  if (tags.some((tag) => !tag)) {
    fail(file, '存在空 tag')
  }
}

if (errors.length > 0) {
  console.error('content lint failed:\n')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(`content lint passed (${files.length} posts)`)
