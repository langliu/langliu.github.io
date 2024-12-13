import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import robotsTxt from 'astro-robots-txt'
import { SITE_URL } from './src/data/config'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), sitemap(), robotsTxt(), mdx()],
  site: SITE_URL,
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'synthwave-84',
      wrap: true
    }
  }
})
