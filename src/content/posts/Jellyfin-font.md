---
title: "Jellyfin 解决中文字幕乱码问题"
publishedAt: 2022-09-01
description: "Jellyfin 解决中文字幕乱码问题"
slug: "jellyfin-chinese"
isPublish: true
---

## 字幕乱码

我的的 Jellyfin 的版本是 10.8.4 版本的。在播放 mkv 格式的视频时，页面字体显示方块：

![字幕乱码](/jellyfin-fonts.jpg)

## 分析原因

Linux 系统对中文的字体支持的不好，并且 ass 字幕文件有指定字体（比如—_微软雅黑_）。

## 解决方式

### 设置字幕烧录

在 **设置/字幕** 中设置字幕烧录（这样非常占用系统资源、会很卡）

![Jellyfin 中设置字幕烧录](/jellyfin-font-setting.jpg)

### 设置备用字体

在 **设置/控制台/播放** 中设置备用字体，通过加载备用字体的方式解决乱码问题。

> 💡 备用字体最好是使用网络字体，例如 woff2 格式的字体（点击下载：<a href="/msyh.woff2" download="msyh.woff2">msyh.woff2</a>）

![Jellyfin 中设置字幕烧录](/images/jellyfin-font-setting-b.jpg)
