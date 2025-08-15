import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import robotsTxt from 'astro-robots-txt'
import { SITE_URL } from './src/data/config.js'
import tailwindcss from '@tailwindcss/vite'
import sentry from '@sentry/astro'

// https://astro.build/config
export default defineConfig({
  integrations: [
    sitemap(),
    robotsTxt(),
    mdx(),
    sentry({
      sourceMapsUploadOptions: {
        project: 'langliu-blog',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
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
