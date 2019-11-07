---
title: Nginx在Windows下开机自动启动
date: 2018-08-26 11:40:59
categories:
  - 环境配置
---

## 安装Nginx

在[Nginx官网下载页面](http://nginx.org/en/download.html)下载Nginx Windows版本，下载后解压，然后运行目录下的 `nginx.exe` 启动nginx，这时打开浏览器输入 `http://localhost:80/` 就可以看见nginx的欢迎页面，说明nginx已经成功启动了。

![nginx](http://ow4hqwlyg.bkt.clouddn.com/nginx.png?limgeslim)

## Windows下开机自启动

关闭计算机后重新打开电脑，这时如果再去访问 `http://localhost:80/` 会报 `404` 错误，因为关机后再次开机并不会自动重启Nginx，如果我们需要每次开机后启动Nginx怎么办呢？难道一次次的去nginx目录下运行nginx.exe吗，不，我们有更简单的方式：

我们可以借助[Windows Service Wrapper](https://github.com/kohsuke/winsw/releases)小工具，将Nginx转换为Windows服务，这样就可以在开机时自动启动Nginx了。

下载后将该工具放入Nginx的安装目录下，并且将其重命名为 `nginx-service.exe` ，在该目录下新建 `nginx-service.xml` 文件，写入配置信息，配置好了之后就可以通过这个将Nginx注册为Windows服务。

```xml
<!-- nginx-service.xml -->
<service>
    <id>nginx</id>
    <name>nginx</name>
    <description>nginx</description>
    <logpath>D:nginx-1.14.0\</logpath>
    <logmode>roll</logmode>
    <depend></depend>
    <executable>D:nginx-1.14.0\nginx.exe</executable>
    <stopexecutable>D:nginx-1.14.0\nginx.exe -s stop</stopexecutable>
</service>
```

### 服务命令

以上内容配置好了之后，在nginx安装目录下以管理员运行命令：`.\nginx-service.exe install` 就成功将其注册为Windows服务了，然后运行 `.\nginx-service.exe start` 启动服务。这时我们可以在Windows任务管理器的服务中查看该是否成功启动。

**注：**

- `nginx-service.exe install` 命令可注册对应的系统服务
- `nginx-service.exe uninstall` 命令可删除对应的系统服务
- `nginx-service.exe stop` 命令可停止对应的系统服务
- `nginx-service.exe start` 命令可启动对应的系统服务