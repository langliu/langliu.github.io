---
title: "React i18next配置"
publishedAt: 2024-12-10
description: "React i18next配置"
slug: "react-i18next"
isPublish: true
---

在现代 Web 应用开发中，国际化（i18n）是一个至关重要的方面，它能够让应用轻松适应不同语言和地区的用户需求。React-i18next 是一个强大且广泛使用的国际化库，专门为 React 应用提供了便捷的国际化解决方案。本文将带领读者快速入门 React-i18next，涵盖从基本安装到实际应用的各个关键步骤。

## 安装

```shell
npm install --save i18next react-i18next i18next-http-backend
```

## 起步

在项目根目录下新建 `locales/index.ts`，并添加以下内容：

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
 .use(initReactI18next)
 .init({
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
         name: 'Name'
       }
     },
     zh: {
       translation: {
         'hello world': '你好世界',
       },
       user: {
         name: '用户名'
       }
     },
   },
  });

export default i18n;
```
在上面的文件中，我们定义了两个语言（英语和中文），并为每个语言添加了2个命名空间（translation和user），并且在每个命名空间里设置了多语言文案的键值对，然后我们就可以通过配置的命名空间+键的方式访问语言对应的文案。

### 在项目中引入

配置完成后，我们就可以在项目中使用了，在项目的 `index.tsx` 中引入i18n实例：

```tsx
import './locales';
```

### 在组件中使用翻译

在 React 组件中，有两种方式可以获取翻译文案：
1. 通过 useTranslation Hook 来获取翻译函数并使用翻译后的文本。
2. 通过 Trans 组件来获取需要翻译的文本。

```tsx
import { useTranslation, Trans } from "react-i18next";

export default function App() {
  const { t } = useTranslation();
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <p>{t("hello world")}</p>
      <p>{t("user:name")}</p>
      <p>
        <Trans ns={"user"} i18nKey={"name"} />
      </p>
    </div>
  );
}
```

#### useTranslation

[`useTranslation`](https://react.i18next.com/latest/usetranslation-hook) Hook 有多种用法，可以在初始化时指定命名单个或多个命名空间，如果不指定的话默认命名空间为在 `locales/index.ts` 实例初始化时指定的命名空间。

> 注意：在 `locales/index.ts` 中可以通过 `defaultNS: 'translation'` 的方式指定默认的命名空间，未指定的话默认命名空间为 `'translation'`

**指定单个命名空间**

当指定单个命名空间时，访问翻译文案时可以直接使用文案的键来获取翻译文案。

```tsx
import { useTranslation, Trans } from "react-i18next";

export default function App() {
  const { t } = useTranslation('user');
  return (
    <div className="App">
      {/* 这里可以直接通过user命名空间下的name来进行访问 */}
      <p>{t("name")}</p>
    </div>
  );
}
```

**指定多个命名空间**

当指定多个命名空间时，`t(i18nKey)` 会采用数组中的第一个命名空间作为默认的命名空间，访问翻译文案有两种方式：
1. 通过 `t('ns:i18nKey')` 的方式来获取翻译文案。
2. 通过 `t('i18nKey', { ns: 'ns'})` 的方式来获取翻译文案(推荐使用这种方式)。

```tsx
import { useTranslation, Trans } from "react-i18next";

export default function App() {
  const { t } = useTranslation(['user', 'translation']);
  return (
    <div className="App">
      <p>{t("hello world", { ns: 'translation' })}</p>
      <p>{t("name")}</p>
      <p>{t("name", { ns: 'user' })}</p>
    </div>
  );
}
```

#### Trans

[`Trans`](https://react.i18next.com/latest/trans-component) 适用于更复杂的情况

```tsx
import { Trans } from "react-i18next";

export default function App() {
  return (
    <div className="App">
      <p><Trans ns={'translation'} i18nKey={'hello world'} /></p>
      <p><Trans ns={'user'} i18nKey={'name'} /></p>
    </div>
  );
}
```

### 从本地JSON文件中加载翻译文案

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

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
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // 翻译文件的路径，默认在public文件夹下
    },
  });

export default i18n;
```

### 类型声明

在项目根目录下新建 `i18next.d.ts`，并添加以下内容：

```ts
// 引入原本的类型声明
import 'i18next';
// import all namespaces (for the default language, only)
import type ns1 from '@/locales/en/ns1.json';
import type ns2 from '@/locales/en/ns2.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    defaultNS: 'ns1';
    // custom resources type
    resources: {
      ns1: typeof ns1;
      ns2: typeof ns2;
    };
    // other
  }
}
```

## 参考文章

- [i18next](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)