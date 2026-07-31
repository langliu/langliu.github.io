import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getPostPath, getPublishedPosts } from '@/utils/posts'

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts()
  const site = context.site

  if (!site) {
    throw new Error('RSS 需要在 astro.config 中配置 site')
  }

  return rss({
    title: '研之有物',
    description: '研之有物 - 前端技术博客',
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: getPostPath(post),
      categories: [post.data.category, ...(post.data.tags ?? [])],
    })),
    customData: '<language>zh-CN</language>',
  })
}
