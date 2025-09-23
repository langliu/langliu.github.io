---
title: CSS 嵌套完全指南：从预处理器到原生支持
publishedAt: 2025-09-20
category: "CSS"
tags:
  - CSS
  - 嵌套
  - Sass
  - Less
  - 原生CSS
  - 最佳实践
slug: css-nesting-complete-guide
isPublish: true
description: 深入探讨 CSS 嵌套的发展历程、语法特性、最佳实践和性能考虑，从预处理器到原生 CSS 嵌套的完整指南。
---

## 引言

CSS 嵌套是现代前端开发中的一个重要特性，它允许开发者以更直观、更有组织的方式编写样式代码。从最初的 Sass 和 Less
预处理器，到如今浏览器原生支持的 CSS 嵌套，这项技术已经成为了前端开发的标准实践。

本文将全面介绍 CSS 嵌套的各个方面：

- 🏗️ **发展历程**：从预处理器到原生支持的演进过程
- 📝 **语法详解**：各种嵌套语法和使用方法
- ⚡ **性能考虑**：嵌套对性能的影响和优化策略
- 🎯 **最佳实践**：如何合理使用嵌套提高代码质量
- 🔧 **工具支持**：现代开发工具对嵌套的支持情况

## CSS 嵌套的发展历程

### 预处理器时代

在原生 CSS 不支持嵌套的年代，开发者通过预处理器来实现这一功能：

#### Sass/SCSS (2006年)

```scss
// SCSS 语法
.nav-item {
  margin-right: 1rem;

  .nav-link {
    color: white;
    text-decoration: none;

    &:hover {
      color: #ccc;
    }

    &.active {
      font-weight: bold;
    }
  }
}
```

#### Less (2009年)

```less
// Less 语法
.nav-item {
  margin-right: 1rem;

  .nav-link {
    color: white;
    text-decoration: none;

    &:hover {
      color: #ccc;
    }

    &.active {
      font-weight: bold;
    }
  }
}
```

### 原生 CSS 嵌套时代

2023年，主流浏览器开始支持原生 CSS 嵌套 (CSS 嵌套发展分为2个阶段，以是否可省略 `&` 区分)：

- 浏览器原生支持：需要显式选择器 `&` 来表示当前选择器的父级元素。

```css
/* 原生 CSS 嵌套 */
.nav-item {
  margin-right: 1rem;

  & .nav-link {
    color: white;
    text-decoration: none;

    &:hover {
      color: #ccc;
    }

    &.active {
      font-weight: bold;
    }
  }
}
```

- 浏览器原生支持：可省略 `&` 符号。

```css
/* 原生 CSS 嵌套 */
.nav-item {
  margin-right: 1rem;

  .nav-link {
    color: white;
    text-decoration: none;

    &:hover {
      color: #ccc;
    }

    &.active {
      font-weight: bold;
    }
  }
}
```

这与单独写入每种样式相同：

```css
.nav-item {
  margin-right: 1rem;
}

.nav-item .nav-link {
  color: white;
  text-decoration: none;
}

.nav-item .nav-link:hover {
  color: #ccc;
}

.nav-item .nav-link.active {
  font-weight: bold;
}
```

## 嵌套语法详解

### 基本嵌套语法

#### 使用 `&` 选择器定义显式关系

如果没有 `&` 选择器默认表示选择后代元素，我们也需要选择相邻元素或者伪类，这时候需要显示声明 `&` :

```css
.feature {
  & button {
    color: blue;
  }

  &:hover {
    color: pink;
  }
}
```

还可以更改上下文，并将 `&` 选择器放在子选择器的末尾或两侧:

```css
button {
  & + & {
    /* button + button */
  }
}

img {
  .my-component & {
    /* .my-component img */
  }
}
```

### 高级嵌套技巧

CSS 条件组规则（例如 `@container`、`@media`、`@supports` 和 `@layer`）也可以嵌套。

```css
.feature {
  @media (min-width: 40em) {
    /* ... */
  }

  @container (inline-size > 900px) {
    /* ... */
  }
}

.feature {
  @supports (display: grid) {
    /* ... */
  }
}

.feature {
  @layer component {
    h2 {
      /* ... */
    }
  }
}
```

## 预处理器 vs 原生 CSS 嵌套

### 语法差异对比

#### Sass/SCSS

```scss
.component {
  background: white;

  .child {
    color: blue;
  }

  // 父选择器引用
  &:hover {
    background: #f5f5f5;
  }

  // 修饰符
  &--large {
    padding: 2rem;
  }

  // 媒体查询
  @media (min-width: 768px) {
    padding: 1rem;
  }
}
```

#### 原生 CSS

```css
.component {
  background: white;

  .child {
    color: blue;
  }

  /* 父选择器引用 */

  &:hover {
    background: #f5f5f5;
  }

  /* 修饰符 */

  .component--large {
    padding: 2rem;
  }

  /* 媒体查询 */
  @media (min-width: 768px) {
    padding: 1rem;
  }
}
```

### 功能特性对比

| 特性         | Sass/SCSS | 原生 CSS | 说明        |
|------------|-----------|--------|-----------|
| 基本嵌套       | ✅         | ✅      | 所有都支持     |
| 父选择器引用 (&) | ✅         | ✅      | 语法略有差异    |
| 媒体查询嵌套     | ✅         | ✅      | 原生支持较新    |
| 属性嵌套       | ✅         | ❌      | 原生不支持     |
| 变量嵌套       | ✅         | ✅      | CSS 自定义属性 |
| 函数嵌套       | ✅         | ❌      | 预处理器特有    |
| 混入嵌套       | ✅         | ❌      | 预处理器特有    |

## 嵌套的最佳实践

### 1. 控制嵌套深度

```css
/* ❌ 过度嵌套：难以维护和理解 */
.page {
  & .content {
    & .sidebar {
      & .widget {
        & .widget-header {
          & .widget-title {
            & .title-icon {
              & .icon-svg {
                fill: currentColor;
              }
            }
          }
        }
      }
    }
  }
}

/* ✅ 合理嵌套：最多 3-4 层 */
.page {
  .content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }
}

.sidebar-widget {
  background: white;
  border-radius: 8px;
  padding: 1rem;

  .widget-header {
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }

  .widget-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    .title-icon {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }
  }
}
```

### 2. 合理使用父选择器引用

```css
/* ✅ 好的使用方式 */
.button {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;

  /* 状态变化 */

  &:hover,
  &:focus {
    background: #0056b3;
  }

  &:active {
    transform: translateY(1px);
  }
}

/* ❌ 避免复杂的父选择器操作 */
.component {
  .component-header {
    .component-header-title {
      .component-header-title-icon {
        /* 生成 .component-header-title-icon */
        /* 这种嵌套方式不够清晰 */
      }
    }
  }
}
```

### 3. 媒体查询嵌套策略

```css
/* ✅ 组件级媒体查询嵌套 */
.card {
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
    display: flex;
    gap: 1rem;
  }

  .card-image {
    width: 100%;

    @media (min-width: 768px) {
      width: 200px;
      flex-shrink: 0;
    }
  }

  .card-content {
    @media (min-width: 768px) {
      flex: 1;
    }
  }
}

/* ❌ 避免过度嵌套媒体查询 */
.complex-component {
  @media (min-width: 768px) {
    .inner {
      @media (min-width: 1024px) {
        .deep {
          @media (min-width: 1200px) {
            /* 过度复杂 */
          }
        }
      }
    }
  }
}
```

### 4. 语义化嵌套结构

```css
/* ✅ 语义化的嵌套结构 */
.article {
  max-width: 800px;
  margin: 0 auto;

  .article-header {
    margin-bottom: 2rem;

    .article-title {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .article-meta {
      color: #666;
      font-size: 0.875rem;
    }
  }

  .article-content {
    line-height: 1.6;

    & p {
      margin-bottom: 1rem;
    }

    & h2 {
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
  }
}

/* ❌ 避免无意义的嵌套 */
.wrapper {
  .container {
    .inner {
      .content {
        /* 过多的包装层级 */
      }
    }
  }
}
```

## 性能考虑

### 1. 选择器性能影响

```css
/* ❌ 性能较差：深层嵌套生成复杂选择器 */
.page .content .sidebar .widget .header .title {
  /* 浏览器需要从右到左匹配每一层 */
  font-size: 1.2rem;
}

/* ✅ 性能更好：使用具体的类名 */
.widget-title {
  font-size: 1.2rem;
}

/* ✅ 适度嵌套：保持语义关系 */
.widget {
  .widget-title {
    font-size: 1.2rem;
  }
}
```

### 2. CSS 文件大小优化

```scss
// ❌ 重复的嵌套会增加文件大小
.card {
  .card-header {
    .card-title {
      font-size: 1.5rem;
    }
  }

  .card-body {
    .card-title {
      font-size: 1.2rem; // 重复的样式
    }
  }
}

// ✅ 提取公共样式
.card-title {
  font-weight: bold;
  line-height: 1.2;
}

.card {
  & .card-header .card-title {
    font-size: 1.5rem;
  }

  & .card-body .card-title {
    font-size: 1.2rem;
  }
}
```

### 3. 运行时性能优化

```css
/* ✅ 使用 CSS 自定义属性优化动态样式 */
.theme-component {
  --primary-color: #007bff;
  --secondary-color: #6c757d;

  background: var(--primary-color);

  .component-header {
    border-bottom: 2px solid var(--primary-color);
  }

  .component-button {
    background: var(--secondary-color);

    &:hover {
      background: color-mix(in srgb, var(--secondary-color) 80%, black);
    }
  }

  /* 主题切换只需修改自定义属性 */

  &[data-theme="dark"] {
    --primary-color: #0d6efd;
    --secondary-color: #495057;
  }
}
```

## 浏览器兼容性

### 原生 CSS 嵌套支持情况

原生 CSS 嵌套的发展过程分为2个阶段：

第一阶段：浏览器开始支持 CSS 嵌套，但是表示根作用域的 `&` 不可省略；

| 浏览器    | 版本        | 支持状态    |
|--------|-----------|---------|
| Chrome | 112-119   | 需使用 `&` |
| Opera  | 98-105    | 需使用 `&` |
| Safari | 16.5-17.1 | 需使用 `&` |
| Edge   | 112-119   | 需使用 `&` |

第二阶段：浏览器开始支持 CSS 嵌套，`&` 可以省略。

| 浏览器     | 版本    | 支持状态   |
|---------|-------|--------|
| Chrome  | 120+  | ✅ 完全支持 |
| Firefox | 117+  | ✅ 完全支持 |
| Safari  | 17.2+ | ✅ 完全支持 |
| Edge    | 112+  | ✅ 完全支持 |
| Opera   | 106+  | ✅ 完全支持 |

### 兼容性解决方案

依赖于 PostCSS 插件 [postcss-nesting](https://www.npmjs.com/package/postcss-nesting) 进行转换

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    // 原生 CSS 嵌套支持
    require('postcss-nesting'),
  ],
};
```

```css
/* 使用 PostCSS 插件进行转换 */

/* 输入：原生 CSS 嵌套 */
.component {
  background: white;

  .child {
    color: blue;

    &:hover {
      color: darkblue;
    }
  }
}

/* 输出：兼容的 CSS */
.component {
  background: white;
}

.component .child {
  color: blue;
}

.component .child:hover {
  color: darkblue;
}
```

CSS 嵌套是现代前端开发的重要工具，合理使用可以显著提高开发效率和代码质量。随着浏览器支持的不断完善，原生 CSS 嵌套将成为未来的主流选择。
