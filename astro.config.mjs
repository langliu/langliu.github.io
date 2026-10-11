import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import cloudflare from '@astrojs/cloudflare'
import node from '@astrojs/node'
import react from '@astrojs/react'
import { d1, r2 } from '@emdash-cms/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import emdash, { local } from 'emdash/astro'
import { sqlite } from 'emdash/db'

if (existsSync('.env')) loadEnvFile('.env')

const isCloudflare = process.env.DEPLOY_TARGET === 'cloudflare'

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  output: 'server',
  adapter: isCloudflare ? cloudflare() : node({ mode: 'standalone' }),
  site: process.env.SITE_URL,
  integrations: [
    {
      name: 'local-site-origin',
      hooks: {
        'astro:config:setup': ({ command, config }) => {
          // 正式地址只用于生产，本地认证与页面链接使用实际请求地址。
          if (command !== 'dev') return
          config.site = undefined
          delete process.env.SITE_URL
          delete process.env.EMDASH_SITE_URL
          delete process.env.EMDASH_ALLOWED_ORIGINS
        },
      },
    },
    react(),
    emdash({
      middleware: { outer: new URL('./src/middleware/security.ts', import.meta.url) },
      database: isCloudflare
        ? d1({ binding: 'DB', session: 'auto' })
        : sqlite({ url: 'file:./.emdash/data.db' }),
      storage: isCloudflare
        ? r2({ binding: 'MEDIA' })
        : local({ directory: './.emdash/uploads', baseUrl: '/_emdash/api/media/file' }),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
