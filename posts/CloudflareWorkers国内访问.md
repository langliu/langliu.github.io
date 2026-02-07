---
title: Cloudflare Workers 国内访问
publishedAt: 2025-08-17
category: 其他
tags:
  - Cloudflare
  - Workers
slug: cloudflare-workers-in-china
isPublish: true
description: 解决cloudflare workers 部署后国内无法访问的问题
---

最近在使用cloudflare workers 部署一个项目，发现部署后国内无法访问。

## 事前准备

- 一个 Cloudflare 账号
- 一个已经转入 Cloudflare 的域名（可以在阿里云、腾讯云、华为云等平台购买，购买后将DNS解析到 Cloudflare 上）
- 优选域名（可在网上搜索关键词“Cloudflare优选域名”，示例使用 `ip.sb`）

> 优选域名可在 [ITDog](https://www.itdog.cn/tcping/) 上查看延迟，延迟越低越好，查询优选域名的443端口，例如：`ip.sb:443`

## 为 Workers 项目设置优选域名

本教程演示的 Worker 使用的自定义域名示例为 `hono-cloudflare-workers.langliu.top`

### 设置自定义域 CNAME 记录至优选域名

在 Cloudflare 控制台中，为自定义域添加 CNAME 记录，指向优选域名，如下图所示：

![cloudflare dns setting](/cloudflare-dns-setting.webp)

> 不要打开 Cloudflare 的代理功能

## 设置 Workers 路由

路由填入 Worker 项目最终使用的自定义域 `hono-cloudflare-workers.langliu.top/*`，Worker 选中对应的Worker项目名后点击保存即可。

![cloudflare workers 路由设置](/cloudflare-workers-routes.webp)

上述的路由设置完成后，即可在 `hono-cloudflare-workers.langliu.top` 访问到 Worker 项目。
