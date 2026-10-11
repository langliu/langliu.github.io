import type { MarkdownHeading } from 'astro'
import type { PortableTextBlock } from 'emdash'
import GithubSlugger from 'github-slugger'
import type { PostListNode } from '@/utils/types/Post'

function groupPostLists(blocks: PortableTextBlock[]): PortableTextBlock[] {
  const result: PortableTextBlock[] = []
  const lists = new Map<
    number,
    { id: unknown; parent: unknown; node: PostListNode; scope?: string }
  >()
  const counts = new Map<string, number>()
  const items = new Map<number, PostListNode['items'][number]>()
  const owners = new Map<string, PostListNode['items'][number]>()

  for (const block of blocks) {
    const ownerKey = block._key.match(/^list-child:([^:]+):/)?.[1]
    const owner = ownerKey ? owners.get(decodeURIComponent(ownerKey)) : undefined
    if (owner) {
      owner.content.push(block)
      continue
    }
    if (block.listItem !== 'number' && block.listItem !== 'bullet') {
      result.push(block)
      lists.clear()
      items.clear()
      owners.clear()
      continue
    }

    const level = typeof block.level === 'number' ? Math.max(1, block.level) : 1
    for (const depth of lists.keys()) if (depth > level) lists.delete(depth)
    for (const depth of items.keys()) if (depth > level) items.delete(depth)
    const parentLevel = Math.max(0, ...[...items.keys()].filter((depth) => depth < level))
    const parent = items.get(parentLevel)
    let list = lists.get(level)
    if (
      list?.id !== block.listId ||
      list?.parent !== parent ||
      list?.node.listItem !== block.listItem
    ) {
      const scope =
        block.listItem === 'number'
          ? JSON.stringify([block.listId ?? block._key, level, parent?._key])
          : undefined
      const node: PostListNode = {
        _type: 'postList',
        _key: `${block._key}-list`,
        listItem: block.listItem,
        start:
          (scope ? (counts.get(scope) ?? 0) : 0) +
          (typeof block.listStart === 'number'
            ? block.listStart
            : typeof block.start === 'number'
              ? block.start
              : 1),
        items: [],
      }
      list = { id: block.listId, parent, node, scope }
      lists.set(level, list)
      if (parent) parent.content.push(node)
      else result.push(node)
    }
    const { listItem: _listItem, level: _level, ...paragraph } = block
    const item = { _key: block._key, content: [paragraph] }
    list.node.items.push(item)
    if (list.scope) counts.set(list.scope, (counts.get(list.scope) ?? 0) + 1)
    items.set(level, item)
    owners.set(block._key, item)
  }
  return result
}

export function getContentText(value: unknown, includeCode = true): string {
  if (Array.isArray(value)) {
    const separator = value.every(
      (node) => node && typeof node === 'object' && node._type === 'span',
    )
      ? ''
      : '\n'
    return value.map((node) => getContentText(node, includeCode)).join(separator)
  }
  if (!value || typeof value !== 'object') return ''
  const node = value as Record<string, unknown>
  if (typeof node.text === 'string') return node.text
  if (!includeCode && ['code', 'table', 'image'].includes(String(node._type))) return ''
  if (typeof node.code === 'string') return node.code
  if (typeof node.html === 'string') return node.html.replace(/<[^>]+>/g, ' ')
  return getContentText(node.children ?? node.content ?? node.rows ?? node.cells, includeCode)
}

export function preparePostContent(content: PortableTextBlock[]): {
  content: PortableTextBlock[]
  headings: MarkdownHeading[]
} {
  const slugger = new GithubSlugger()
  const headings: MarkdownHeading[] = []
  const blocks = content.map((block) => {
    const style = typeof block.style === 'string' ? block.style : ''
    if (block._type !== 'block' || !/^h[1-6]$/.test(style)) return block
    const text = getContentText(block.children).trim()
    const slug = slugger.slug(text)
    headings.push({ depth: Number(style.slice(1)), slug, text })
    return { ...block, headingId: slug }
  })
  return { content: groupPostLists(blocks), headings }
}
