---
title: '在浏览器中通过 import maps 使用 ES 模块'
description: '在浏览器中通过 import maps 使用 ES 模块'
publishedAt: 2022-12-22
tags:
  - JavaScript
  - HTML
isPublish: true
slug: 'import-map'
---

## ES 模块简介

[ES Module](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules) 是 JavaScript 模块化的官方标准， 目前主流的浏览器已经实现，不依赖任何第三方加载器 (Loader) 即可使用。

[点击查看浏览器最新支持情况](https://caniuse.com/mdn-javascript_statements_import)

在浏览器中， 可以这样使用原生 ES 模块化的 JavaScript 脚本：

```js
// my_func.js
export function my_func() {
  /* function content goes here */
}
```

```html
<script type="module">
  import { my_func } from './my_func.js'
  my_func()
</script>
```

> 浏览器中只支持相对路径或者绝对路径下的 ES 模块 (./, ../, /, http://, https://) ， 同时也受服务器跨域请求策略、 HTTPS 策略的约束。

## import maps

在 Node.js 环境下， 可以这样导入全局模块：

```js
import * as _loadash from 'loadash'
```

Node.js 会自动从 node_modules 目录中去加载对应的模块， 但是浏览器默认不会这样做，因为不知道从哪里加载全局模块。

import-maps 就是为了解决浏览器中的全局模块而出现的， 目前浏览器的支持情况如下图所示， 基于 Chromium 和 Firefox 的浏览器已经实现这个功能。

![Can I Use](/can-i-use-import-maps.png)

对于不支持 import-maps 的浏览器， 可以使用 [es-module-shims](https://github.com/guybedford/es-module-shims) 进行处理。

import-maps 使用 Json 的形式来定义浏览器中的全局模块：

```html
<script type="importmap">
  {
    "imports": {
      "loadash": "/libs/loadash/index.js",
      "jquery": "/libs/jquery/index.js",
      "three": "/libs/three.js/three.js",
      "three/examples/": "/libs/three.js/examples/"
    }
  }
</script>
```

全局 ES 模块的定义分两种形式：

- 通过别名指定模块的地址， 适用于只有一个 js 文件的模块；
- 通过路径指定模块的目录，适用于多个 js 文件组成的模块；

有了上面的 importmap 定义， 可以在浏览器环境中这样使用全局模块：

```js
import * as _loadash from 'loadash' // 自动加载 /libs/loadash/index.js
import $ from 'jquery' // 自动加载 /libs/jquery/index.js
import { Scene, WebGLRenderer } from 'three' // 自动加载 /libs/three.js/three.js
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js' // 自动加载 /libs/three.js/examples/jsm/cameras/CinematicCamera.js
```
