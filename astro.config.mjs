import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import robotsTxt from 'astro-robots-txt'
import { SITE_URL } from './src/data/config.js'
import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  integrations: [sitemap(), robotsTxt(), mdx()],
  site: SITE_URL,
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'synthwave-84',
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
