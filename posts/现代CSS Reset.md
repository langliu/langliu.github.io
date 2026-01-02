---
title: '现代 CSS Reset 规则'
publishedAt: 2025-09-20
category: "CSS"
tags:
  - CSS
slug: 'modern-css-reset'
isPublish: true
description: 'A (more) Modern CSS Reset'
---

```css
/* Box sizing rules */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Prevent font size inflation */
html {
  -moz-text-size-adjust: none;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
}

/* Remove default margin in favour of better control in authored CSS */
body, h1, h2, h3, h4, p,
figure, blockquote, dl, dd {
  margin-block-end: 0;
}

/* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */
ul[role='list'],
ol[role='list'] {
  list-style: none;
}

/* Set core body defaults */
body {
  min-height: 100vh;
  line-height: 1.5;
}

/* Set shorter line heights on headings and interactive elements */
h1, h2, h3, h4,
button, input, label {
  line-height: 1.1;
}

/* Balance text wrapping on headings */
h1, h2,
h3, h4 {
  text-wrap: balance;
}

/* A elements that don't have a class get default styles */
a:not([class]) {
  text-decoration-skip-ink: auto;
  color: currentColor;
}

/* Make images easier to work with */
img,
picture {
  max-width: 100%;
  display: block;
}

/* Inherit fonts for inputs and buttons */
input, button,
textarea, select {
  font-family: inherit;
  font-size: inherit;
}

/* Make sure textareas without a rows attribute are not tiny */
textarea:not([rows]) {
  min-height: 10em;
}

/* Anything that has been anchored to should have extra scroll margin */
:target {
  scroll-margin-block: 5ex;
}
```

## 分解

```css
/* Box sizing rules */
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

这条规则很容易理解，简而言之，我将所有元素和伪元素设置为使用 `border-box` ， 而不是默认的 `content-box` 来设置 sizing 。现在我们更专注于让浏览器通过流体类型和空间的灵活布局来处理更多工作 ，这条规则不再像以前那么有用了。但是，很少有项目没有明确的尺寸设置，所以它在重置中仍然有一席之地。

```css

/* Prevent font size inflation */
html {
  -moz-text-size-adjust: none;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
}
```

对此最好的解释是 Kilian 的 。他还解释了为什么我们仍然需要那些丑陋的前缀。

```css

/* Remove default margin in favour of better control in authored CSS */
body, h1, h2, h3, h4, p,
figure, blockquote, dl, dd {
  margin-block-end: 0;
}
```

我一直倾向于移除用户代理样式中的边距，以便在更宏观的层面上定义流和空间 。有了逻辑属性，我现在移除的是末端边距，而不是像旧重置那样移除所有边距。这在生产环境中似乎效果很好。

```css

/* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */
ul[role='list'],
ol[role='list'] {
  list-style: none;
}
```

Safari 做了一些疯狂的事情，其中​​包括这个 ：如果你删除列表样式，他们就会删除 VoiceOver 的语义。有人会说这是个功能，有人会说是个 bug。我认为这很愚蠢，但为了确保它能发挥 role ，我默认删除了列表样式，算是给它一点小奖励。

```css

/* Set core body defaults */
body {
  min-height: 100vh;
  line-height: 1.5;
}
```

我喜欢清晰易读且可继承的行高。在 body 上设置最小高度 100vh 也非常方便，尤其是在设置装饰元素的时候。使用像 dvh 这样的新单位可能很诱人，但如果你像 Ahmad 一样深入研究 ，就会发现这样做带来的问题比解决方案更多，而这可不是你想要的重置结果！

```css
/* Set shorter line heights on headings and interactive elements */
h1, h2, h3, h4,
button, input, label {
  line-height: 1.1;
}
```

就像全局设置较大的 line-height 很方便一样，标题和按钮等元素的 line-height 较低也同样方便。但是，如果你的字体有较大的上升部和下降部，那么绝对值得删除或修改此规则。你最不希望看到的是它们相互冲突，造成可访问性问题。

```css
/* Balance text wrapping on headings */
h1, h2,
h3, h4 {
  text-wrap: balance;
}
```

这条规则与我们的项目比较相关，但新增加的 `text-wrap` 属性让标题看起来更美观。我想有些人会觉得这条规则不太合适，所以你可能需要删除这条规则。

```css
/* A elements that don't have a class get default styles */
a:not([class]) {
  text-decoration-skip-ink: auto;
  color: currentColor;
}
```

这条规则首先要确保文本修饰不会干扰上升部和下降部。我认为这在现在的浏览器中大多是默认设置，但最好也设置一下。我们喜欢在 Studio 中默认将链接设置为继承文本的 `currentColor` ，但如果没有，您可能需要将其删除。

```css
/* Inherit fonts for inputs and buttons */
input,
button,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
}
```

此时让表单元素和按钮继承一些字体属性很有用。这主要会影响 `<textarea>` 元素，但将其应用于其他表单元素也无妨，因为它可以在项目后期节省一些 CSS 代码。

```css
/* Make sure textareas without a rows attribute are not tiny */
textarea:not([rows]) {
  min-height: 10em
}
```

说到 `<textarea>` 元素，这条规则很方便。默认情况下，如果不添加 rows 属性，它们可能会非常小。这对于像手指这样的粗指针来说并不理想，而且 `<textarea>` 元素通常用于多行文本。简化这一点很有意义。

```css
/* Anything that has been anchored to should have extra scroll margin */
:target {
  scroll-margin-block: 5ex;
}
```

最后，如果某个元素是锚定元素，则可以使用 `scroll-margin` 在其上方添加一些空间，但只有当该元素被定位时才会生效。这个小小的调整可以带来极致的用户体验！不过，如果您使用的是固定标题，您可能需要调整它。
