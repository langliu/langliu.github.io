import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
// import node from '@astrojs/node'

// https://astro.build/config
export default defineConfig({
  site: 'https://langiu.github.io',
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
  ],
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'dracula',
      wrap: true,
    },
  },
  // adapter: node({
  //   mode: 'standalone',
  // }),
  // output: 'server',
})
