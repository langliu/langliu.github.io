import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import robotsTxt from 'astro-robots-txt'
import { SITE_URL } from './src/data/config.js'

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  integrations: [sitemap(), robotsTxt(), mdx()],
  site: SITE_URL,
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
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
