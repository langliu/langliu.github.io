import type { PostCategory } from '@/utils/types/Post'

// 保留旧分类链接，并为冲突的原生 slug 留出独立路径。
const LEGACY_CATEGORY_SLUGS = new Map([
  ['css', 'CSS'],
  ['vue', 'Vue'],
  ['react', 'React'],
  ['html', 'HTML'],
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
])
const LEGACY_PUBLIC_SLUGS = new Set(LEGACY_CATEGORY_SLUGS.values())

export function getCategorySlug(category: PostCategory): string {
  const legacySlug = LEGACY_CATEGORY_SLUGS.get(category.slug)
  if (legacySlug) return legacySlug
  if (LEGACY_PUBLIC_SLUGS.has(category.slug) || category.slug.startsWith('~')) {
    return `~${category.slug}`
  }
  return category.slug
}

export function getCategoryPath(category: PostCategory): string {
  return `/categories/${encodeURIComponent(getCategorySlug(category))}`
}

export function getCategoryBySlug(
  slug: string,
  categories: PostCategory[],
): PostCategory | undefined {
  const category = categories.find((category) => getCategorySlug(category) === slug)
  if (category) return category
  // 同时接受旧分类的原生小写路径，避免别名匹配到同名的新分类。
  return LEGACY_CATEGORY_SLUGS.has(slug)
    ? categories.find((category) => category.slug === slug)
    : undefined
}

export function getCategoryByFilter(
  filter: string,
  categories: PostCategory[],
): PostCategory | undefined {
  return (
    categories.find((category) => category.slug === filter) ??
    getCategoryBySlug(filter, categories) ??
    categories.find((category) => category.label === filter)
  )
}
