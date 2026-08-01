import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import robotsTxt from 'astro-robots-txt'
import { SITE_URL } from './src/data/config.js'

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  integrations: [sitemap(), robotsTxt(), mdx()],
  site: SITE_URL,
  redirects: {
    '/posts/windows-use-7zip-bitch-zip': '/posts/windows-use-7zip-batch-zip',
    '/categories/其他': '/categories/others',
  },
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
