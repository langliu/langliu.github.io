import type { APIContext } from 'astro'

export function GET({ redirect }: APIContext) {
  return redirect('/sitemap.xml', 301)
}
