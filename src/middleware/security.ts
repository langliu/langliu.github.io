import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware((context, next) => {
  let pathname: string
  try {
    pathname = decodeURIComponent(context.url.pathname)
  } catch {
    return new Response('无效的请求路径', { status: 400 })
  }
  // 即使开发者显式开放网络监听，也不能通过开发接口绕过管理员认证。
  if (/^\/_emdash\/api\/(?:auth|setup)\/dev-bypass\/?$/.test(pathname)) {
    return new Response(
      JSON.stringify({ success: false, error: { message: '开发登录绕过已禁用' } }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }

  // WebAuthn 的 RP ID 需要域名，本地后台统一使用 localhost。
  if (
    import.meta.env.DEV &&
    context.request.method === 'GET' &&
    ['127.0.0.1', '[::1]'].includes(context.url.hostname) &&
    /^\/_emdash\/admin(?:\/|$)/.test(context.url.pathname)
  ) {
    const url = new URL(context.url)
    url.hostname = 'localhost'
    return context.redirect(url.toString(), 302)
  }

  return next()
})
