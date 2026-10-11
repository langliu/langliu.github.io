import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import bash from 'shiki/langs/bash.mjs'
import css from 'shiki/langs/css.mjs'
import go from 'shiki/langs/go.mjs'
import html from 'shiki/langs/html.mjs'
import javascript from 'shiki/langs/javascript.mjs'
import json from 'shiki/langs/json.mjs'
import jsonc from 'shiki/langs/jsonc.mjs'
import jsx from 'shiki/langs/jsx.mjs'
import less from 'shiki/langs/less.mjs'
import markdown from 'shiki/langs/markdown.mjs'
import powershell from 'shiki/langs/powershell.mjs'
import scss from 'shiki/langs/scss.mjs'
import sql from 'shiki/langs/sql.mjs'
import tsx from 'shiki/langs/tsx.mjs'
import typescript from 'shiki/langs/typescript.mjs'
import yaml from 'shiki/langs/yaml.mjs'
import synthwave from 'shiki/themes/synthwave-84.mjs'

// 仅加载博客使用的语言，避免把全部语法和 WASM 打包进 Worker。
const highlighter = createHighlighterCore({
  themes: [synthwave],
  langs: [
    bash,
    css,
    go,
    html,
    javascript,
    json,
    jsonc,
    jsx,
    markdown,
    less,
    scss,
    powershell,
    sql,
    tsx,
    typescript,
    yaml,
  ],
  engine: createJavaScriptRegexEngine(),
})

export async function highlightCode(code: string, language = 'text'): Promise<string> {
  const instance = await highlighter
  const candidate = language === 'shell' ? 'bash' : language
  const lang = instance.getLoadedLanguages().includes(candidate) ? candidate : 'text'
  return instance.codeToHtml(code, { lang, theme: 'synthwave-84' })
}
