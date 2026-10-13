import { z } from 'astro/zod'
import { getEmDashCollection, getEmDashEntry } from 'emdash'
import { getContentText } from '@/utils/portableText'
import { postCoverSchema } from '@/utils/postCover'
import type { PostEntry } from '@/utils/types/Post'

export type { PostEntry } from '@/utils/types/Post'

const postSchema = z.object({
  seo: z
    .object({
      title: z.string().nullable(),
      description: z.string().nullable(),
      image: z.string().nullable(),
      canonical: z.string().nullable(),
      noIndex: z.boolean(),
    })
    .nullish(),
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  publishedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  terms: z.object({
    category: z.array(z.object({ label: z.string(), slug: z.string() })).optional(),
    tag: z.array(z.object({ label: z.string() })).optional(),
  }),
  cover: postCoverSchema,
  content: z.array(z.object({ _type: z.string(), _key: z.string() }).loose()),
})

function normalizePost(entry: { id: string; data: unknown }): PostEntry {
  const data = postSchema.parse(entry.data)
  return {
    id: entry.id,
    body: getContentText(data.content),
    readingText: getContentText(data.content, false),
    data: {
      ...data,
      publishedAt: data.publishedAt ?? data.createdAt,
      hasPublicationDate: data.publishedAt !== null,
      category: data.terms.category?.[0] ?? { label: '其他', slug: 'others' },
      tags: data.terms.tag?.map((term) => term.label) ?? [],
      cover: data.cover?.src,
      seo: data.seo ?? undefined,
    },
  }
}

export async function getPublishedPosts(): Promise<PostEntry[]> {
  const posts: PostEntry[] = []
  let cursor: string | undefined
  do {
    const result = await getEmDashCollection('posts', {
      status: 'published',
      limit: 100,
      cursor,
      orderBy: { published_at: 'desc' },
    })
    if (result.error) throw result.error
    posts.push(...result.entries.map(normalizePost))
    cursor = result.nextCursor
  } while (cursor)
  assertUniquePostSlugs(posts)
  return posts.sort(
    (first, second) => second.data.publishedAt.getTime() - first.data.publishedAt.getTime(),
  )
}

export async function getPostBySlug(slug: string): Promise<PostEntry | undefined> {
  const { entry, error } = await getEmDashEntry('posts', slug)
  if (error) throw error
  return entry ? normalizePost(entry) : undefined
}

export function getPostSlug(post: PostEntry): string {
  return post.data.slug
}

export function getPostPath(post: PostEntry): string {
  return `/posts/${getPostSlug(post)}`
}

export function getPostTags(post: PostEntry): string[] {
  return [...new Set(post.data.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [])]
}

export function getTagPath(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}`
}

export function getPostUpdatedAt(post: PostEntry): Date {
  return post.data.updatedAt
}

export function getSortedTagStats(posts: PostEntry[]): Array<[string, number]> {
  const tagStats = new Map<string, number>()

  for (const post of posts) {
    for (const tag of getPostTags(post)) {
      tagStats.set(tag, (tagStats.get(tag) ?? 0) + 1)
    }
  }

  return [...tagStats.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1]
    }

    return left[0].localeCompare(right[0], 'zh-CN')
  })
}

export function getAdjacentPosts(
  posts: PostEntry[],
  current: PostEntry,
): {
  newer?: PostEntry
  older?: PostEntry
} {
  const currentIndex = posts.findIndex((post) => post.id === current.id)

  if (currentIndex === -1) {
    return {}
  }

  return {
    newer: currentIndex > 0 ? posts[currentIndex - 1] : undefined,
    older: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : undefined,
  }
}

export function getRelatedPosts(posts: PostEntry[], current: PostEntry, limit = 3): PostEntry[] {
  const currentTags = new Set(getPostTags(current))

  return posts
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const sharedTags = getPostTags(post).filter((tag) => currentTags.has(tag)).length
      const sameCategory = post.data.category.slug === current.data.category.slug ? 1 : 0
      const score = sharedTags * 2 + sameCategory

      return { post, score }
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return right.post.data.publishedAt.getTime() - left.post.data.publishedAt.getTime()
    })
    .slice(0, limit)
    .map((item) => item.post)
}

export function getSortedCategoryStats(
  posts: PostEntry[],
): Array<[PostEntry['data']['category'], number]> {
  const categoryStats = new Map<string, [PostEntry['data']['category'], number]>()

  for (const post of posts) {
    const category = post.data.category
    const existing = categoryStats.get(category.slug)
    if (existing) existing[1] += 1
    else categoryStats.set(category.slug, [category, 1])
  }

  return [...categoryStats.values()].sort(
    (left, right) => right[1] - left[1] || left[0].label.localeCompare(right[0].label, 'zh-CN'),
  )
}

function assertUniquePostSlugs(posts: PostEntry[]): void {
  const slugToPostIdMap = new Map<string, string>()

  for (const post of posts) {
    const duplicatePostId = slugToPostIdMap.get(post.data.slug)

    if (duplicatePostId) {
      throw new Error(
        `Duplicate post slug "${post.data.slug}" found in "${duplicatePostId}" and "${post.id}". Please keep slugs unique.`,
      )
    }

    slugToPostIdMap.set(post.data.slug, post.id)
  }
}
