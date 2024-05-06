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

## TypeScript 和库模式

Vite 创建的 `tsconfig.json` 只包含文件夹 `src` 。要为新创建的 `lib` 文件夹启用 TypeScript，您需要将其添加到 TypeScript 配置文件中，如下所示：

```json
"include": ["src", "lib"],
```

尽管需要为 `src` 和 `lib` 文件夹启用 TypeScript，但在构建库时最好不要包含 `src` 。

为了确保在构建过程中仅包含 `lib` 目录，您可以创建一个专门用于构建的单独的 TypeScript 配置文件。

> 💡 实现这个单独的配置有助于避免当您直接从演示页面上的 `dist` 文件夹导入组件并且这些组件尚未构建时出现 TypeScript 错误。

```
📂my-component-library
  ┣ …
  ┣ 📜tsconfig.json
 +┣ 📜tsconfig-build.json
  …
```

唯一的区别是构建配置仅包含 `lib` 目录，而默认配置包含 `lib` 和 `src`

```json
{
  "extends": "./tsconfig.json",
  "include": ["lib"]
}
```

要使用 `tsconfig-build.json` 进行构建，您需要将配置文件传递给 `package.json` 中构建脚本中的 `tsc` ：

```json
"build": "tsc --p ./tsconfig-build.json && vite build",
```

最后，您还需要将文件 `vite-env.d.ts` 从 `src` 复制到 `lib` 。如果没有这个文件，Typescript 将在构建时错过 Vite 提供的一些类型定义（因为我们不再包含 `src` ）。

您现在可以再次执行 `npm run build` ，这就是您将在 `dist` 文件夹中看到的内容：

```bash
 📂dist
  ┣ 📜my-component-library.js
  ┗ 📜vite.svg
```

💡 输出文件的名称默认与 `package.json` 中的 `name` 属性相同。这可以在 Vite 配置（ `build.lib.fileName` ）中更改，但我们稍后会对此做一些其他事情。

文件 `vite.svg` 位于您的 `dist` 文件夹中，因为 Vite 将所有文件从 `public` 目录复制到输出文件夹。让我们禁用此行为：

```json
build: {
  copyPublicDir: false
}
```

## 构建类型

由于这是一个 Typescript 库，您还希望随包一起提供类型定义。幸运的是，有一个 Vite 插件可以做到这一点：[vite-plugin-dts](https://github.com/qmhc/vite-plugin-dts)

```bash
npm i vite-plugin-dts -D
```

默认情况下 dts 将为 `src` 和 `lib` 生成类型，因为这两个文件夹都包含在项目的 `.tsconfig` 中。这就是为什么我们需要传递一个配置参数： `include: ['lib']`。

```ts
import dts from 'vite-plugin-dts'

...
  plugins: [react(), dts({ include: ['lib'] })]
...
```

> 💡 它也适用于 exclude: ['src'] 或使用不同的 Typescript 配置文件进行构建。

为了进行测试，让我们向您的库添加一些实际代码。打开 `lib/main.ts` 并导出一些内容，例如：

```ts
export function helloAnything(thing: string): string {
  return `Hello ${thing}!`
}
```

## 没有组件的React组件库是什么？

现在打包的话React组件的实现包含 React JSX 代码，因此 react （和 react/jsx-runtime ）也被捆绑在一起。

由于该库将在已安装 React 的项目中使用，因此您可以外部化此依赖项以从捆绑包中删除代码：

```ts
//vite.config.ts
  build: {
    …
+   rollupOptions: {
+     external: ['react', 'react/jsx-runtime'],
+   }
  }
```
