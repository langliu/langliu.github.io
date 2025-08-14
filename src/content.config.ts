import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './posts' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.date(),
    description: z.string(),
    isPublish: z.boolean(),
    isDraft: z.boolean().default(false),
    slug: z.string(),
    category: z.enum(['CSS', 'Vue', 'React', '其他', 'HTML', 'JavaScript', 'TypeScript']),
    tags: z.array(z.string()).nullable().optional(),
  }),
})

export const collections = { posts }
