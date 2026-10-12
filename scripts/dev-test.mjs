import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { backup, DatabaseSync } from 'node:sqlite'
import { after, before, test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import { OptionsRepository } from 'emdash'
import { createDialect } from 'emdash/db/sqlite'
import { Kysely } from 'kysely'

let directory
let server
let origin
let logs = ''

before(async () => {
  directory = await mkdtemp(resolve(tmpdir(), 'langliu-dev-test-'))
  await writeFile(resolve(directory, '.env'), 'SITE_URL=https://blog.example.com\n')
  await mkdir(resolve(directory, '.emdash'))
  const source = new DatabaseSync('.emdash/data.db')
  await backup(source, resolve(directory, '.emdash/data.db'))
  source.close()
  const db = new Kysely({ dialect: createDialect({ url: `file:${directory}/.emdash/data.db` }) })
  try {
    await new OptionsRepository(db).set('emdash:setup_complete', true)
  } finally {
    await db.destroy()
  }
  const socket = createServer()
  await new Promise((done) => socket.listen(0, '127.0.0.1', done))
  const { port } = socket.address()
  await new Promise((done) => socket.close(done))
  origin = `http://localhost:${port}`
  server = spawn(
    process.execPath,
    [
      resolve('node_modules/astro/bin/astro.mjs'),
      'dev',
      '--ignore-lock',
      '--root',
      resolve('.'),
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    {
      cwd: directory,
      env: {
        ...process.env,
        DEPLOY_TARGET: '',
        SITE_URL: 'https://blog.example.com',
        EMDASH_SITE_URL: 'https://admin.example.com',
        EMDASH_ALLOWED_ORIGINS: 'https://preview.example.com',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )
  server.stdout.on('data', (data) => {
    logs += data
  })
  server.stderr.on('data', (data) => {
    logs += data
  })
  for (let count = 0; count < 200; count++) {
    try {
      if ((await fetch(origin)).status === 200) return
    } catch {}
    if (server.exitCode !== null) throw new Error(logs)
    await delay(100)
  }
  throw new Error(`开发服务未启动：${logs}`)
})

after(async () => {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM')
    await new Promise((done) => server.once('exit', done))
  }
  if (directory) await rm(directory, { recursive: true, force: true })
})

test('开发环境禁用全部登录绕过入口，包括编码路径和 POST', async () => {
  for (const method of ['GET', 'POST']) {
    for (const path of ['setup/dev-bypass', 'auth/dev-bypass', 'setup/%64ev-bypass']) {
      const response = await fetch(`${origin}/_emdash/api/${path}?token=1`, {
        method,
        redirect: 'manual',
      })
      assert.equal(response.status, 403, `${method} ${path}`)
      assert.equal((await response.json()).data?.token, undefined)
    }
  }
})

test('正式域名配置不影响本地通行密钥和页面地址', async () => {
  const response = await fetch(`${origin}/_emdash/api/auth/passkey/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.equal(result.data.options.rpId, 'localhost')
  const page = await (await fetch(origin)).text()
  assert.ok(!page.includes('https://blog.example.com'))
  const redirect = await fetch(`${origin.replace('localhost', '127.0.0.1')}/_emdash/admin/setup`, {
    redirect: 'manual',
  })
  assert.equal(redirect.status, 302, `${await redirect.text()}\n${logs}`)
  assert.equal(new URL(redirect.headers.get('location')).hostname, 'localhost')
})
