---
title: "Windows 下使用7-Zip批量压缩文件夹"
publishedAt: 2022-09-03
description: "Windows 下使用7-Zip批量压缩文件夹"
slug: "windows-use-7zip-bitch-zip"
isPublish: true
---

## 起因

最近发现电脑的存储内存不太够了，于是决定整理电脑里的文件，整理文件的时候发现电脑中有许多按文件夹分类存储的文件，这些文件平时基本上没有用过，正好我的阿里云盘上有较大的存储空间，我就想着将这些文件通过 7-Zip 压缩一下，压缩完成后上传到阿里云盘中存起来，需要的时候再下载就好。

## 解决

这么多文件夹如果自己一个个压缩效率太慢了，肯定有快捷方式可以批量压缩文件夹，于是我就在网上搜索了一下 “7-Zip 批量压缩” 发现在 Windows 系统环境下可以用批处理工具使用 7-Zip 来批量压缩文件夹 📂，找到的命令如下：

```powershell
for /d %%X in (*) do "C:\Program Files\7-Zip\7z.exe" a "%%~dpnX.7z" "%%X" -p123456 -mhe -mx=0
```

### 创建批处理文件

在 Windows 下创建批处理文件的方式如下：

1. 新建一个 `.txt` 文本文件，将批处理命令写入文本文件中
2. 将创建的文本文件重命名，将文件后缀由 `.txt` 改为 `.bat`

### 优化

在我本地进行打包的时候，我的文件夹名称中有 `.` 符号，不知道什么原因打包后的压缩文件名称只有 `.` 前面的（比如说我的文件夹名称为“lang.1289”则打包后的文件名称为“lang.7z”），缺失了一部分，这样的话打包时就有一些文件重名了。经过一番查询，得到了一个新命令：

```shell
for /d %%Z in (*) do  "c:\Program Files\7-Zip\7z.exe" a -bd "%%Z.7z" "%%Z\" -p123456 >zip.log
```

## 参考文章

- [7ZIP软件如何批量压缩7Z格式 并设置密码如123456 跪求？- 知乎](https://www.zhihu.com/question/31567041)
- [windows下批量用7z压缩文件夹](https://evvail.com/2020/06/23/713.html)