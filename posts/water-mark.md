---
title: '从头开始实现一个水印组件'
publishedAt: 2024-12-30
description: 'Windows 下使用7-Zip批量压缩文件夹'
slug: 'watermark'
isPublish: true
category: 'React'
---

水印组件的主要功能是在页面的特定区域（通常是背景）显示半透明的文字或图案，用于标识文档或页面的版权等信息。

在很多组件库（比如Antd和Arco都 Watermark 水印组件），那么这个组件的实现原理是什么呢？

![Arco Watermark](/acro-watermark.webp)

从上面的图可以看出，水印组件的实现有3点：

1. 设置一个盖在目标元素上的一个div， 通过绝对定位的方式使得水印区域的宽高和目标元素的宽高是一致的；
2. 通过设置 `pointer-events: none;` 不响应鼠标事件使得鼠标事件可以透传到被盖住的目标元素上；
3. 设置 `background-image` 设置一个 base64 格式的图片来展示水印内容。

前2点都很简单，主要技术难点在第3点，如何通过传入的文字或图片生成一个 base64 格式的图片呢？
