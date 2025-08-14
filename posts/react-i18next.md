---
title: 'React i18next 配置'
publishedAt: 2024-12-10
description: 'React i18next 配置'
slug: 'react-i18next'
isPublish: true
category: 'React'
---

在现代 Web 应用开发中，国际化（i18n）是一个至关重要的方面，它能够让应用轻松适应不同语言和地区的用户需求。React-i18next 是一个强大且广泛使用的国际化库，专门为 React 应用提供了便捷的国际化解决方案。本文将带领读者快速入门 React-i18next，涵盖从基本安装到实际应用的各个关键步骤。

## 安装

```shell
npm install --save i18next react-i18next i18next-http-backend
```

## 起步

在项目根目录下新建 `locales/index.ts`，并添加以下内容：

```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n.use(initReactI18next).init({
  lng: 'zh', // 默认语言
  fallbackLng: 'en', // 回退语言
  debug: true, // 开发模式下启用调试
  interpolation: {
    escapeValue: false, // 允许在翻译中使用 HTML 标签
  },
  resources: {
    en: {
      translation: {
        'hello world': 'hello world',
      },
      user: {
        name: 'Name',
      },
    },
    zh: {
      translation: {
        'hello world': '你好世界',
      },
      user: {
        name: '用户名',
      },
    },
  },
})

export default i18n
```

在上面的文件中，我们定义了两个语言（英语和中文），并为每个语言添加了2个命名空间（translation和user），并且在每个命名空间里设置了多语言文案的键值对，然后我们就可以通过配置的命名空间+键的方式访问语言对应的文案。

### 在项目中引入

配置完成后，我们就可以在项目中使用了，在项目的 `index.tsx` 中引入i18n实例：

```tsx
import './locales'
```

### 在组件中使用翻译

在 React 组件中，有两种方式可以获取翻译文案：

1. 通过 useTranslation Hook 来获取翻译函数并使用翻译后的文本。
2. 通过 Trans 组件来获取需要翻译的文本。

```tsx
import { useTranslation, Trans } from 'react-i18next'

export default function App() {
  const { t } = useTranslation()
  return (
    <div className='App'>
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <p>{t('hello world')}</p>
      <p>{t('user:name')}</p>
      <p>
        <Trans ns={'user'} i18nKey={'name'} />
      </p>
    </div>
  )
}
```

#### useTranslation

[`useTranslation`](https://react.i18next.com/latest/usetranslation-hook) Hook 有多种用法，可以在初始化时指定命名单个或多个命名空间，如果不指定的话默认命名空间为在 `locales/index.ts` 实例初始化时指定的命名空间。

> 注意：在 `locales/index.ts` 中可以通过 `defaultNS: 'translation'` 的方式指定默认的命名空间，未指定的话默认命名空间为 `'translation'`

**指定单个命名空间**

当指定单个命名空间时，访问翻译文案时可以直接使用文案的键来获取翻译文案。

```tsx
import { useTranslation, Trans } from 'react-i18next'

export default function App() {
  const { t } = useTranslation('user')
  return (
    <div className='App'>
      {/* 这里可以直接通过user命名空间下的name来进行访问 */}
      <p>{t('name')}</p>
    </div>
  )
}
```

**指定多个命名空间**

当指定多个命名空间时，`t(i18nKey)` 会采用数组中的第一个命名空间作为默认的命名空间，访问翻译文案有两种方式：

1. 通过 `t('ns:i18nKey')` 的方式来获取翻译文案。
2. 通过 `t('i18nKey', { ns: 'ns'})` 的方式来获取翻译文案(推荐使用这种方式)。

```tsx
import { useTranslation, Trans } from 'react-i18next'

export default function App() {
  const { t } = useTranslation(['user', 'translation'])
  return (
    <div className='App'>
      <p>{t('hello world', { ns: 'translation' })}</p>
      <p>{t('name')}</p>
      <p>{t('name', { ns: 'user' })}</p>
    </div>
  )
}
```

#### Trans

[`Trans`](https://react.i18next.com/latest/trans-component) 适用于更复杂的情况，比如在翻译文案中需要使用HTML标签或者React组件对文案内容进行包裹：

比如有以下翻译文案：“离比赛开始还有{{value}}天”，我们是在一个列表中渲染，我们期望value的样式根据结束时间有动态的变化，比如小于3天的结束时间，我们期望value的样式为红色，大于3天的结束时间，我们期望value的样式为绿色，我们可以通过以下方式来实现：

1. 对翻译文案进行调整，将value的样式通过HTML标签进行包裹：`离比赛开始还有<1>{{value}}</1>天`
2. 使用 `Trans` 组件来包裹翻译文案，其中
   1. `i18nKey` 是翻译文案的Key；
   2. `ns` 是翻译文案所在的命名空间；
   3. `values` 是自定义差值的对象；
   4. `components` 是自定义组件的对象，其中的key是翻译文案中标签的标识（标识可以是任意字符串，需要于翻译文案中声明的标识相对应），value是自定义组件（自定义组件需要闭合）；

```tsx
import { Trans } from 'react-i18next'

export default function App() {
  return (
    <div className='App'>
      <p>
        <Trans
          ns={'translation'}
          i18nKey={'startWith'}
          values={{ value: 7 }}
          components={{ 1: <span className={'green'} /> }}
        />
        <Trans
          ns={'translation'}
          i18nKey={'startWith'}
          values={{ value: 2 }}
          components={{ 1: <span className={'red'} /> }}
        />
      </p>
    </div>
  )
}
```

### 插入值

在翻译文案中，有很多时候我们需要在语句中间插入一些自定义的值，比如 “离比赛开始还有XX天” 这种场景，其中的我们是想要自定义输入的，那么在 i18next 中我们可以通过以下方式来实现：

在翻译文案中使用 `离比赛开始还有{{value}}天` 的方式来插入值：

在代码中使用下面的方式来插入值（变量的名称需要和在声明的时候保持一致）：

```tsx
// hooks 方式使用
{t('hello world', { value: '10' })}
// Trans 组件方式使用
<Trans i18nKey={'hello world'} values={{ value: '10' }}>
```

## 从本地JSON文件中加载翻译文案

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'zh', // 默认语言
    fallbackLng: 'en', // 回退语言
    debug: true, // 开发模式下启用调试
    interpolation: {
      escapeValue: false, // 允许在翻译中使用 HTML 标签
    },
    ns: ['translation', 'ns1', 'ns2'], // 命名空间，用于区分不同的翻译文件（必须）
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // 翻译文件的路径，默认在public文件夹下
    },
  })

export default i18n
```

## 类型声明

在项目根目录下新建 `i18next.d.ts`，并添加以下内容：

```ts
// 引入原本的类型声明
import 'i18next'
// import all namespaces (for the default language, only)
import type ns1 from '@/locales/en/ns1.json'
import type ns2 from '@/locales/en/ns2.json'

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'ns1'
    // custom resources type
    resources: {
      ns1: typeof ns1
      ns2: typeof ns2
    }
    // other
  }
}
```

## 示例

下面是一个基于本地JSON文件的完整示例：

<iframe src="https://codesandbox.io/embed/nrz6dc?view=editor+%2B+preview&module=%2Fsrc%2FApp.tsx"
style="width:100%; height: 500px; border:0; border-radius: 4px; overflow:hidden;"
title="react-i18next-example"
allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

## 编辑器支持

i18n 是一个比较通用的功能，目前WebStorm和VSCode都有对应的插件支持，下面是一些插件的介绍：

### VSCode

安装 [i18n Ally](https://marketplace.visualstudio.com/items?itemName=Lokalise.i18n-ally) 插件，然后在 `settings.json` 中添加以下配置：

```json
{
  "i18n-ally.localesPaths": ["public/locales"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.defaultNamespace": "translation",
  "i18n-ally.displayLanguage": "zh",
  "i18n-ally.editor.preferEditor": false,
  "i18n-ally.enabledFrameworks": ["i18next", "react-i18next"],
  "i18n-ally.enabledParsers": ["json"],
  "i18n-ally.namespace": true
}
```

![i18n Ally screenshot](https://github.com/antfu/i18n-ally/raw/screenshots/review-sidebar.png?raw=true)

### WebStorm

安装插件[i18n Ally](https://plugins.jetbrains.com/plugin/17212-i18n-ally)

![i18n Ally screenshot](https://plugins.jetbrains.com/files/17212/screenshot_e34d916c-a298-4cd3-b3b7-93abf51d06d6)

> 注意：WebStorm 插件维护情况不是很好，暂不支持WebStorm 2024.3及以上版本。

## 快速翻译

在实际项目中，我们可能会有很多种语言，单个需求下所涉及到的翻译文案较多，这时如果还是一个单词一个单词的翻译的话，会非常浪费时间，
这时我们可以借助一些工具来快速翻译，我最近做了一个支持翻译JSON文件的工具网站 [i18n JSON Translate](https://i18n-json-translate.langliu.xyz/)，
支持输入JSON格式的翻译文案，选择目标语言，点击翻译按钮，即可快速翻译。

![i18n JSON Translate screenshot](/images/i18n-json-translate.webp)

## 参考文章

- [i18next](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)
