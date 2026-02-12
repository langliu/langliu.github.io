import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { POST_CATEGORIES } from './data/postCategories'

const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './posts' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.date(),
    description: z.string(),
    isPublish: z.boolean(),
    isDraft: z.boolean().default(false),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'slug 仅支持小写字母、数字和中划线（kebab-case）',
    }),
    category: z.enum(POST_CATEGORIES),
    tags: z.array(z.string()).nullable().optional(),
  }),
})

export const collections = { posts }
