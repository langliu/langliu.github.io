---
title: '快速创建组件库🚀'
publishedAt: 2024-05-01
description: '快速创建组件库🚀（使用Vite的库模式）'
slug: 'vite-component-library'
isPublish: false
---

如果您正在管理多个 React 应用程序并希望用户界面之间保持一致性，那么您迟早会发现您需要一个组件库。

当我第一次想创建一个 React 组件库时，我花了很多时间才找到一个满足我所有要求并且不太复杂的设置。

像这样的指南可以让我节省大量的精力去解决这些问题。我希望它能帮助你，就像它对我有帮助一样。

这篇文章介绍了设置和发布 React 组件库，包括配置构建过程并将包发布到 npm，以便您和/或其他人可以使用它。

**我已尽力保持所有配置简单明了，并尽可能使用默认设置。**

完成后，您可以像安装任何其他 npm 包一样安装您的库：

```bash
npm install @username/my-component-library
```

并像这样使用它：

```tsx
import { Button } from `@username/my-component-library`;

function MyComponent() {
  return <Button>Click me!</Button>
}
```

## 新建一个Vite项目

如果您从未使用过 Vite，请将其视为 Create React App 的替代品。只需几个命令，您就可以开始了。

```bash
npm create vite@latest
? Project name: › my-component-library
? Select a framework: › React
? Select a variant: › TypeScript
cd my-component-library
npm i
```

就这样，您的新 Vite/React 项目已准备就绪。

## 基本构建设置

您现在可以运行 `npm run dev` 并浏览到 Vite 提供的 URL。在处理库时，您可以在此处轻松导入库并实际查看组件。将 `src` 文件夹中的所有代码视为演示页面。

实际的库代码将驻留在另一个文件夹中。让我们创建这个文件夹并将其命名为 `lib` 。您也可以对其进行不同的命名，但 `lib` 是一个不错的选择。

库的主要入口点将是 `lib` 内名为 `main.ts` 的文件。安装库时，您可以导入从此文件导出的所有内容。

```bash
📂my-component-library
 +┣ 📂lib
 +┃ ┗ 📜main.ts
  ┣ 📂public
  ┣ 📂src
  …
```

## Vite图书馆模式

此时，如果您使用 `npm run build` 构建项目，Vite 会将 `src` 中的代码转译到 `dist` 文件夹中。这是默认的 Vite 行为。

目前，您将仅将演示页面用于开发目的。所以还不需要转译项目的这一部分。相反，您想要在 `lib` 内转译和发送代码。

这就是Vite的图书馆模式发挥作用的地方。它是专门为构建/转译库而设计的。要激活此模式，只需在 `vite.config.ts` 中指定您的库入口点即可。

就像这样：

```ts
import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      formats: ['es'],
    },
  },
})
```

> 默认格式为 'es' 和 'umd' 。对于您的组件库，“es”就是您所需要的。这也消除了添加 name 属性的必要性。
> 如果你的 TypeScript linter 提示 `path` 和 `__dirname` 只需安装节点的类型： `npm i @types/node -D`
