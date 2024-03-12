---
title: 'Vite vs Webpack'
publishedAt: 2024-03-12
description: 'Vite 和 Webpack 都是现代前端开发中常用的构建工具，它们各自有着不同的特点和适用场景。'
slug: 'vite-vs-webpack'
isPublish: true
---

## Webpack

Webpack 是一个成熟的打包工具，它通过模块化的方式处理前端资源，包括 JavaScript、CSS、图片等。Webpack 的主要特点包括：

- 模块化打包：Webpack 可以将项目中的多个模块及其依赖打包成一个或多个 bundle 文件，优化资源加载。
- 插件系统：Webpack 提供了强大的插件系统，允许开发者扩展其功能，例如压缩、热更新等。
- 兼容性：Webpack 支持多种模块系统，如 CommonJS 和 ES6，以及预处理器，如 Sass、Less。
- 开发和生产环境配置：Webpack 允许为开发环境和生产环境设置不同的配置，以优化开发体验和生产效率。
- 社区支持：Webpack 拥有庞大的社区和丰富的文档，有大量的教程和案例可供参考。

然而，Webpack 也存在一些缺点，如配置复杂、构建速度慢等，特别是在大型项目中。

## Vite

Vite 是一个新兴的前端构建工具，由 Vue.js 的作者尤雨溪开发。Vite 的设计理念是利用现代浏览器的原生 ES 模块导入功能来提供快速的开发体验。Vite 的主要特点包括：

- 快速的冷启动：Vite 利用浏览器的原生 ES 模块功能，减少了启动时的打包工作，从而实现快速启动。
- 即时的模块热更新（HMR）：Vite 提供了快速的模块热替换功能，使得开发过程中的修改能够即时反映在浏览器中。
- 按需编译：Vite 仅编译当前页面需要的模块，而不是整个应用，这使得大型项目的构建更加高效。
- 开箱即用：Vite 提供了预配置的构建指令，简化了开发流程。
- TypeScript 支持：Vite 内置了对 TypeScript 的支持，无需额外配置即可使用。

Vite 旨在解决 Webpack 在大型项目中的性能瓶颈，通过简化配置和优化构建流程来提升开发效率。然而，作为一个相对较新的工具，Vite 的社区和插件生态可能不如 Webpack 成熟。

## 为什么Vite比Webpack快

### 构建方式

![Webpack 构建原理图](/images/webpack-build.jpg)

上图是Webpack在本地启动项目时的一个过程表示，当你使用 Webpack 打包一个项目时，通常会生成一个或多个 bundle 文件，这些文件包含了你的应用程序所需的所有代码、样式和资源。然后，你可以在 HTML 文件中通过 `<script>` 标签引入这些 bundle 文件，从而加载你的应用程序。但是随着项目规模的增大，通常会有更多的模块需要打包。Webpack 需要扫描整个项目的依赖图，并分析模块之间的依赖关系，这个过程会变得更加复杂和耗时。

![Vite 构建原理图](/images/vite-build.jpg)

本地启动一个Vite项目时，和Webpack有一些不一样了，Server服务一开始就启动，然后通过网络请求去加载对应了文件。

Vite的构建特点，我们可以用下面几点来概括。

- 基于浏览器原生 ES 模块支持：Vite 利用了现代浏览器对 ES 模块（ESM）的原生支持，采用的是一种no bundle的策略，当使用 Vite 启动项目时，它会将每个模块都作为一个独立的文件提供给浏览器，而不需要像传统的打包工具（如 Webpack）那样先将模块打包成一个或多个 bundle。这样一来，浏览器可以更快地加载和解析这些模块，从而实现了快速的冷启动速度。
- 即时编译（Instant Compilation）：Vite 采用了即时编译策略。当浏览器请求一个模块时，Vite 会即时地将该模块编译成浏览器可执行的代码，并将编译结果缓存起来（我们在node_modules下可以找到一个.vite文件）。下次再次请求同一模块时，Vite 可以直接返回缓存的编译结果，而不必重新编译，从而避免了冗余的编译过程，大大提高了启动速度。
- esbuild预构建依赖：Go 语言编写的快速、轻量级的 JavaScript/TypeScript 构建工具，比以 JavaScript 编写的打包器预构建依赖快 10-100 倍。

### 热更新

Webpack 的热更新机制是通过 webpack-dev-server 提供的功能来实现的。webpack-dev-server 是一个开发服务器，用于在开发过程中提供快速的开发体验，包括热更新、自动刷新等功能。

Webpack-dev-server 的热更新机制是基于 WebSocket 技术实现的。当你启动 webpack-dev-server 时，它会创建一个 WebSocket 服务器，与浏览器端建立连接。然后，webpack-dev-server 会监视项目文件的变化，并将这些变化推送给浏览器端，浏览器端收到变化后会执行相应的更新操作，从而实现了热更新的效果。

具体来说，webpack-dev-server 的热更新机制包括以下几个步骤：

1. 创建 WebSocket 服务器：webpack-dev-server 在启动时会创建一个 WebSocket 服务器，并与浏览器端建立连接。
2. 监听文件变化：webpack-dev-server 会监听项目文件的变化，包括入口文件、模块文件、样式文件等。
3. 构建更新模块：当文件发生变化时，webpack-dev-server 会重新构建变化的模块，并生成更新的代码。
4. 推送更新信息：webpack-dev-server 将更新的模块信息通过 WebSocket 推送给浏览器端。
5. 浏览器端处理更新：浏览器端接收到更新信息后，会根据更新的模块信息执行相应的更新操作，例如重新加载模块、更新页面内容等。

而Vite 也使用了 WebSocket 技术来实现与浏览器的通信。当有模块变化时，Vite 会通过 WebSocket 将更新信息推送给浏览器端，从而触发浏览器端的模块重载。这样看起来，它和Webpack似乎没有什么不同，但是根据Vite官网的说法，在 Vite 中，HMR 是在原生 ESM 上执行的。当编辑一个文件时，Vite 只需要精确地使已编辑的模块与其最近的 HMR 边界之间的链失活（大多数时候只是模块本身），使得无论应用大小如何，HMR 始终能保持快速更新。从官网的解释中我们可以理解为，Vite因为支持ESM的能力，使得它比Webpack拥有更小粒度的热更新能力。
