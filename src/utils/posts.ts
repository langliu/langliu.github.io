import { type CollectionEntry, getCollection } from 'astro:content'
import { POST_CATEGORIES } from '@/data/postCategories'

export type PostEntry = CollectionEntry<'posts'>
let publishedPostsPromise: Promise<PostEntry[]> | undefined

export async function getPublishedPosts(): Promise<PostEntry[]> {
  publishedPostsPromise ??= getCollection('posts')
    .then((posts) =>
      posts
        .filter((post) => post.data.isPublish && !post.data.isDraft)
        .sort(
          (first, second) => second.data.publishedAt.getTime() - first.data.publishedAt.getTime(),
        ),
    )
    .then((posts) => {
      assertUniquePostSlugs(posts)
      return posts
    })

  return publishedPostsPromise
}

export function getPostSlug(post: PostEntry): string {
  return post.data.slug
}

export function getPostPath(post: PostEntry): string {
  return `/posts/${getPostSlug(post)}`
}

export function getSortedCategoryStats(
  posts: PostEntry[],
): Array<[PostEntry['data']['category'], number]> {
  const initialCategoryStats = Object.fromEntries(
    POST_CATEGORIES.map((category) => [category, 0]),
  ) as Record<PostEntry['data']['category'], number>

  const categoryStats = posts.reduce<Record<PostEntry['data']['category'], number>>(
    (acc, post) => {
      const category = post.data.category
      acc[category] = (acc[category] ?? 0) + 1
      return acc
    },
    initialCategoryStats,
  )

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
