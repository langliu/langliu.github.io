import { z } from 'astro/zod'
import { getEmDashCollection, getEmDashEntry } from 'emdash'
import { POST_CATEGORIES } from '@/data/postCategories'
import { getContentText } from '@/utils/portableText'
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
  published_date: z.coerce.date(),
  updated_date: z.coerce.date().nullish(),
  category: z.enum(POST_CATEGORIES),
  tags: z.array(z.string()).nullish(),
  cover: z.object({ src: z.string() }).nullish(),
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
      publishedAt: data.published_date,
      updatedAt: data.updated_date ?? undefined,
      tags: data.tags ?? [],
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
      orderBy: { published_date: 'desc' },
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
  return post.data.updatedAt ?? post.data.publishedAt
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
      const sameCategory = post.data.category === current.data.category ? 1 : 0
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
  const initialCategoryStats = Object.fromEntries(
    POST_CATEGORIES.map((category) => [category, 0]),
  ) as Record<PostEntry['data']['category'], number>

  const categoryStats = posts.reduce<Record<PostEntry['data']['category'], number>>((acc, post) => {
    const category = post.data.category
    acc[category] = (acc[category] ?? 0) + 1
    return acc
  }, initialCategoryStats)

  return Object.entries(categoryStats)
    .filter(([, count]) => count > 0)
    .sort(([, first], [, second]) => second - first) as Array<
    [PostEntry['data']['category'], number]
  >
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
