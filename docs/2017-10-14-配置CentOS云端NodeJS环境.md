---
title: 配置CentOS云端NodeJS环境
date: 2017-10-14 23:35:25
categories:
    - 环境配置
---

最近买了一个阿里云的云服务器，想要把自己的项目部署到阿里云上可以通过外网访问，阿里云上配置环境的时候有许多的不懂的地方，这是我配置环境的步骤，将此记下来：

<!-- more -->

## 安装 `Nginx`

在 `CentOS` 上，可直接使用 `yum` 来安装Nginx：

```
yum install nginx -y
```

安装完成后，使用 `nginx` 命令启动 Nginx：

```
nginx
```

此时，访问 http://IP 可以看到 Nginx 的测试页面。

如果此时不能访问，则是因为云服务器 ECS 未开放80端口，不能通过公网访问80端口，此时进入 `管理控制台/云服务器ECS/网络和安全/安全组` 添加一个新的规则，使之能够通过公网访问80端口，如果需要暴露其他端口，同样需要在安全组中配置安全规则。

### 配置静态服务器访问路径

外网用户访问服务器的 Web 服务由 Nginx 提供，Nginx 需要配置静态资源的路径信息才能通过 url 正确访问到服务器上的静态资源。

打开 Nginx 的默认配置文件 `/etc/nginx/nginx.conf` ，修改 Nginx 配置，将默认的 `root /usr/share/nginx/html;` 修改为: `root /data/www;`，如下：
nginx.conf

配置文件将 `/data/www/static` 作为所有静态资源请求的根路径，如访问: `http://IP/static/index.js`，将会去 `/data/www/static/` 目录下去查找 `index.js`。现在我们需要重启 Nginx 让新的配置生效，如：

```
nginx -s reload
```

重启后，现在我们应该已经可以使用我们的静态服务器了，现在让我们新建一个静态文件，查看服务是否运行正常。

首先让我们在 `/data` 目录 下创建 `www` 目录，如：

```
mkdir -p /data/www
```

创建第一个静态文件
在 `/data/www` 目录下创建我们的第一个静态文件 `index.html`：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <title></title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="css/style.css" rel="stylesheet">
</head>

<body>
    <p>Hello World!</p>
</body>

</html>
```
现在访问 http://IP/index.html 应该可以看到页面输出 `Hello world!`

到此，一个基于 Nginx 的静态服务器就搭建完成了，现在所有放在   `/data/www` 目录下的的静态资源都可以直接通过域名访问。

## 安装最新版 git

在 CentOS 下可以使用 `yum` 命令直接安装 git ：`yum install git`，但是因为 yum 仓库的源比较旧，所以安装的 git 版本比较老，我最近使用 yum 安装的 git 的版本为 `1.8.3` ，而最新的版本为 `2.14.2` ，版本差了太多了。

## 部署Node.js环境 - 使用NVM安装多版本

NVM（Node version manager）是Node.js的版本管理软件，使用户可以轻松在Node.js各个版本间进行切换。适用于长期做 node 开发的人员或有快速更新node版本、快速切换node版本这一需求的用户。

安装步骤：

1、直接使用git将源码克隆到本地的~/.nvm目录下，并检查最新版本。

```
yum install git
git clone https://github.com/cnpm/nvm.git ~/.nvm && cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`
```

2、激活NVM。

```
echo ". ~/.nvm/nvm.sh" >> /etc/profile
source /etc/profile
```

3、列出Node.js的所有版本。

```
nvm list-remote
```

4、安装多个Node.js版本。

```
nvm install v6.11.4
nvm install v8.7.0
```

5、查看已安装Node.js版本，当前使用的版本为v8.7.0。

```
[root@iZuf62didsxigy36d6kjtrZ .nvm]# nvm ls
->       v6.11.4
         v8.7.0
```

6、切换Node.js版本至v6.11.4。

```
[root@iZuf62didsxigy36d6kjtrZ .nvm]# nvm use v6.11.4
Now using node v6.11.4
```

## 安装进程管理器

安装进程管理器以便控制Node.js应用程序，这个进程管理器可以保持应用程序一直在运行，运行以下命令进行安装：

```powershell
[root@localhost ~]# npm install pm2 -g
```

### 使用pm2启动进程

```
pm2 start app.js // 该命令会保证 app.js 一直在后台运行
```

### 查看所有进程

```
pm2 list // 该命令会列出所有在后台运行的进程
```

## 安装Mongodb

### 配置包管理系统（yum）

创建一个/etc/yum.repos.d/mongodb-org-3.4.repo文件，使您可以直接安装MongoDB。在文件中写入下面内容：

```cmd
[mongodb-org-3.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc
```

### 安装MongoDB软件包和相关工具。

要安装最新的稳定版本的MongoDB，请发出以下命令：

```cmd
sudo yum install -y mongodb-org
```
### 数据目录和权限

MongoDB实例默认存储其数据文件/var/lib/mongo 及其日志文件/var/log/mongodb，并使用mongod 用户帐户运行。您可以在其中指定备用日志和数据文件目录/etc/mongod.conf。查看systemLog.path 和storage.dbPath获取更多信息。

如果更改运行MongoDB进程的用户，则 必须修改对/var/lib/mongo和 /var/log/mongodb目录的访问控制权限，以使该用户能够访问这些目录。

### 操作

#### 启动MongoDB。

您可以mongod通过发出以下命令来启动该过程：

```
sudo service mongod start
```

#### 验证MongoDB已经成功启动

您可以mongod通过检查日志文件的内容进行/var/log/mongodb/mongod.log 读取来验证进程是否成功启动

```
[initandlisten] waiting for connections on port <port>
```

其中<port>被配置为在该端口/etc/mongod.conf，27017默认情况下。

#### 停止MongoDB。

根据需要，您可以mongod通过发出以下命令来停止进程：

```
sudo service mongod stop
```

#### 重新启动MongoDB。

您可以mongod通过发出以下命令重新启动该过程：

```
sudo service mongod restart
```

您可以通过查看/var/log/mongodb/mongod.log文件中的输出来跟踪进程的状态，以查找错误或重要消息。    
## 查看端口号

```
netstat -anl|grep "端口号"
```


