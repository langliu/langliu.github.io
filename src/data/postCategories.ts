export const POST_CATEGORIES = [
  'CSS',
  'Vue',
  'React',
  '其他',
  'HTML',
  'JavaScript',
  'TypeScript',
] as const

export type PostCategory = (typeof POST_CATEGORIES)[number]

/**
 * 分类展示名 -> URL slug。
 * 英文分类保持原名；中文分类映射为 ASCII，避免路径编码问题。
 */
export const CATEGORY_SLUG_BY_NAME = {
  CSS: 'CSS',
  Vue: 'Vue',
  React: 'React',
  其他: 'others',
  HTML: 'HTML',
  JavaScript: 'JavaScript',
  TypeScript: 'TypeScript',
} as const satisfies Record<PostCategory, string>

export const CATEGORY_NAME_BY_SLUG = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_BY_NAME).map(([name, slug]) => [slug, name]),
) as Record<(typeof CATEGORY_SLUG_BY_NAME)[PostCategory], PostCategory>

export function getCategorySlug(category: PostCategory): string {
  return CATEGORY_SLUG_BY_NAME[category]
}

export function getCategoryPath(category: PostCategory): string {
  return `/categories/${getCategorySlug(category)}`
}

export function getCategoryBySlug(slug: string): PostCategory | undefined {
  return CATEGORY_NAME_BY_SLUG[slug as keyof typeof CATEGORY_NAME_BY_SLUG]
}
