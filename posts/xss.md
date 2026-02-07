---
title: '前端安全：如何防御XSS攻击'
isPublish: true
description: '随着互联网的高速发展，信息安全问题已经成为企业最为关注的焦点之一，而前端又是引发企业安全问题的高危据点。'
publishedAt: 2024-03-23
slug: 'xss'
category: 'JavaScript'
---

## 什么是XSS攻击？

XSS（Cross-Site Scripting，跨站脚本攻击）攻击允许攻击者在用户的浏览器上执行恶意脚本，从而窃取敏感信息或进行其他恶意行为，
是[代码注入](https://www.wikiwand.com/zh-hans/%E4%BB%A3%E7%A2%BC%E6%B3%A8%E5%85%A5)的一种。

## 如何发起攻击

XSS 分为三种：**反射型**，**存储型**和 **DOM-based**

XSS 通过修改 HTML 节点或者执行 JS 代码来攻击网站。

例如通过 URL 获取某些参数

```tsx
// https://www.domain.com?name=<script>alert(1)</script>
<div>{name}</div>
```

### 存储型的 XSS 攻击

在存储型的XSS攻击中：

1. ⾸先⿊客利⽤站点漏洞将⼀段恶意 JavaScript 代码提交到⽹站的数据库中；
2. 然后⽤⼾向⽹站请求包含了恶意 JavaScript 脚本的⻚⾯；
3. 当⽤⼾浏览该⻚⾯的时候，恶意脚本就会将⽤⼾的 Cookie 信息等数据上传到服务器。

![存储型XSS攻击示意](/save-xss.webp)

### 反射型的 XSS 攻击

恶意 JavaScript 脚本属于⽤⼾发送给⽹站请求中的⼀部分，随后⽹站⼜把恶意 JavaScript 脚本返回
给⽤⼾。当恶意 JavaScript 脚本在⽤⼾⻚⾯中被执⾏时，⿊客就可以利⽤该脚本做⼀些恶意操作。
在现实⽣活中，⿊客经常会通过 QQ 群或者邮件等渠道诱导⽤⼾去点击这些恶意链接，所以对于⼀些链接我们⼀定要慎之⼜慎。
Web 服务器不会存储反射型 XSS 攻击的恶意脚本，这是和存储型 XSS 攻击不同的地⽅。

### 基于 DOM 的 XSS 攻击

基于 DOM 的 XSS 攻击是不牵涉到⻚⾯ Web服务器的。具体来讲，⿊客通过各种⼿段将恶意脚本注⼊⽤⼾的⻚⾯中，⽐如通过⽹络劫持在⻚⾯传输过程中修改 HTML ⻚⾯的内容，这种劫持类型很多，有通过 WiFi 路由器劫持的，有通过本地恶意软件来劫持的，它们的共同点是在 Web资源传输过程或者在⽤⼾使⽤⻚⾯的过程中修改 Web ⻚⾯的数据。

## 如何防御

### 服务器对输⼊脚本进⾏过滤或转码

最普遍的做法是转义输入输出的内容，对于引号，尖括号，斜杠进行转义：

```jsx
function escape(str) {
  str = str.replace(/&/g, '&amp;')
  str = str.replace(/</g, '&lt;')
  str = str.replace(/>/g, '&gt;')
  str = str.replace(/"/g, '&quto;')
  str = str.replace(/'/g, '&#39;')
  str = str.replace(/`/g, '&#96;')
  str = str.replace(/\//g, '&#x2F;')
  return str
}
```

通过转义可以将攻击代码 `<script>alert(1)</script>` 变成：

```jsx
// -> &lt;script&gt;alert(1)&lt;&#x2F;script&gt;
escape('<script>alert(1)</script>')
```

对于显示富文本来说，不能通过上面的办法来转义所有字符，因为这样会把需要的格式也过滤掉。这种情况通常采用白名单过滤的办法，当然也可以通过黑名单过滤，但是考虑到需要过滤的标签和标签属性实在太多，更加推荐使用白名单的方式。

```jsx
var xss = require('xss')
var html = xss('<h1 id="title">XSS Demo</h1><script>alert("xss");</script>')
// -> <h1>XSS Demo</h1>&lt;script&gt;alert("xss");&lt;/script&gt;
console.log(html)
```

以上示例使用了 `js-xss` 来实现。可以看到在输出中保留了 `h1` 标签且过滤了 `script` 标签。

### 充分利⽤ CSP

内容安全策略 (**[CSP](https://developer.mozilla.org/zh-CN/docs/Glossary/CSP)**) 是一个额外的安全层，用于检测并削弱某些特定类型的攻击，包括跨站脚本 (**[XSS](https://developer.mozilla.org/zh-CN/docs/Glossary/Cross-site_scripting)**) 和数据注入攻击等。无论是数据盗取、网站内容污染还是散发恶意软件，这些攻击都是主要的手段。

我们可以通过 CSP 来尽量减少 XSS 攻击。CSP 本质上也是建立白名单，规定了浏览器只能够执行特定来源的代码。

通常可以通过 HTTP Header 中的 `Content-Security-Policy` 来开启 CSP

- 只允许加载本站资源

  ```jsx
  Content-Security-Policy: default-src ‘self’
  ```

- 只允许加载 HTTPS 协议图片

  ```jsx
  Content-Security-Policy: img-src https://*
  ```

- 允许加载任何来源框架

  ```jsx
  Content-Security-Policy: child-src 'none'
  ```

限制加载其他域下的资源⽂件、禁⽌向第三⽅域提交数据，这样⽤⼾数据也不会外泄、禁⽌执⾏内联脚本和未授权的脚、提供上报机制

### 使⽤ HttpOnly 属性

`HttpOnly` 是包含在Set-Cookie HTTP响应头文件中的附加标志。生成cookie时使用 `HttpOnly` 标志有助于降低客户端脚本访问受保护cookie的风险（如果浏览器支持）。

这个意思就是说，如果某一个 Cookie 选项被设置成 `HttpOnly=true` 的话，那此 Cookie 只能通过服务器端修改，JavaScript 是操作不了的，对于 `document.cookie` 来说是透明的。

### 框架支持

目前大部分前端框架中都默认对XSS的注入进行了防御，比如在ReactJS中用户的输入都会默认转译成安全的string类型，如果需要插入可执行的JavaScript代码需要在代码成手动声明 `dangerouslySetInnerHTML`。
