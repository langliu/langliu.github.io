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

### 在组件中使用翻译

在 React 组件中，可以通过 useTranslation Hook 来获取翻译函数并使用翻译后的文本。

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('greeting')}</h1>
      <p>{t('description')}</p>
    </div>
  );
};

export default MyComponent;
```

## 参考文章

- [i18next](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)