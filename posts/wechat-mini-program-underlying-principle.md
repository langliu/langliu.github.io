---
title: 微信小程序底层原理
description: 小程序是基于双线程模型的，在这个模型中，小程序的逻辑层与渲染层分开在不同的线程运行，这跟传统的Web 单线程模型有很大的不同
slug: wechat-mini-program-underlying-principle
isPublish: true
publishedAt: 2024-04-02
category: 'JavaScript'
---

## 小程序的由来

当微信中的 WebView 逐渐成为移动 Web 的一个重要入口时，微信就有相关的 JS API。早期，腾讯内部一些业务使用 WeixinJSBridge 调用了一些微信原生能力，但是没有对外开放。2015年初，微信发布了一整套网页开发工具包，称之为 JS-SDK，开放了更多微信原生能力。为了提供更原生的体验、更快的加载、更强大的能力，微信开始设计小程序应用，并于 2016 年 9 月开始内测，2017 年 1 月正式上线。

## 双线程架构

小程序是基于双线程模型的，在这个模型中，小程序的逻辑层与渲染层分开在不同的线程运行，逻辑层采用 JSCore 运行 JavaScript 代码，渲染层使用 WebView 进行渲染，每个小程序页面都是用不同的 WebView 去渲染，这样可以提供更好的交互体验，更贴近原生体验，也避免了单个 WebView 的任务过于繁重。

两个线程之间由 Native 层之间统一处理，无论是线程之间的通信，还是数据的传递，网络请求都是由 Native 层做转发。

![微信小程序架构模型](/images//wechat-mini-program.png)

逻辑层和视图层之间的工作方式为：数据变更通过 setData 驱动视图更新；视图层交互触发事件，然后触发逻辑层的事件响应函数，函数中修改数据再次触发视图更新。

![小程序逻辑层与视图层通信](/images/mini-program-setdata.png)

### 为什么采用双线程架构

#### 管控与安全

Web技术是非常开放灵活的，可以利用 JavaScript 脚本随意地跳转网页或者改变界面上的任意内容。除此之外，一些可以展示敏感数据的组件（这些数据只能被展示，开发者并不能拿到数据），若开发者可以通过 JavaScript 操作界面（DOM树），从而直接获取这些敏感数据，那小程序毫无安全可言。因此，要彻底解决这个问题，必须提供一个沙箱环境来运行开发者的 JavaScript 代码。

#### 天生异步

既然小程序是基于双线程模型，那就意味着任何数据传递都是线程间的通信，也就是都会有一定的延时。这不像传统Web那样，当界面需要更新时，通过调用更新接口UI就会同步地渲染出来。在小程序架构里，这一切都会变成异步。

## 参考

- [微信公众平台 - 3.1 渲染层和逻辑层](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0000286f908988db00866b85f5640a)
- [微信公众平台 - 6.1 双线程模型](https://developers.weixin.qq.com/ebook?action=get_post_info&docid=0006a2289c8bb0bb0086ee8c056c0a)
