---
title: 'macOS zsh 完整配置：环境变量、补全与历史命令提示'
publishedAt: 2026-08-22
description: '以 macOS + Oh My Zsh 为例，整理 zsh 启动文件、Homebrew、PATH、开发工具、命令补全和历史命令搜索的完整配置方式。'
isPublish: true
slug: 'zsh-history-command-suggestions'
category: '其他'
tags:
  - zsh
  - macOS
  - Oh My Zsh
  - 命令行
---

## 为什么需要整理 zsh 配置

macOS 默认使用 zsh。随着开发工具逐渐增多，zsh 配置通常会同时承担几类职责：

- 初始化 Oh My Zsh 和主题；
- 配置命令历史记录；
- 提供 `Tab` 补全、历史命令提示和上下方向键搜索；
- 管理 Bun、Node.js、PostgreSQL、Cargo 等工具的环境变量；
- 加载 Homebrew、Grok 等工具生成的补全脚本。

如果所有内容都直接堆在一个文件中，配置很容易重复加载，或者因为加载顺序不正确导致命令找不到。本文以当前使用的 macOS + zsh + Oh My Zsh 环境为例，整理一套完整配置。

## zsh 的启动文件

zsh 会根据启动模式读取不同的配置文件：

| 文件 | 加载时机 | 适合放置的内容 |
| --- | --- | --- |
| `~/.zshenv` | 所有 zsh 进程 | 必须对所有 zsh 生效的基础环境变量 |
| `~/.zprofile` | 登录 shell | Homebrew 和登录环境初始化 |
| `~/.zshrc` | 交互式 shell | 主题、插件、补全、别名和开发工具配置 |
| `~/.zlogin` | 登录 shell，晚于 `.zprofile` | 很少使用的登录后操作 |

日常终端配置主要使用 `.zshenv`、`.zprofile` 和 `.zshrc`。Cargo 这类基础环境可以放在 `.zshenv`，而 Oh My Zsh、补全和 PATH 配置应该放在 `.zshrc`。

## 安装 Oh My Zsh 和历史命令提示

如果还没有安装 Oh My Zsh，可以先完成安装。本文使用的历史命令灰色提示插件通过 Homebrew 安装：

```bash
brew install zsh-autosuggestions
```

`history-substring-search` 已经包含在当前 Oh My Zsh 中，不需要重复安装。

## `~/.zshenv`：基础环境

当前配置使用 Cargo 提供的环境初始化脚本：

```zsh
# Cargo 环境
if [[ -r "$HOME/.cargo/env" ]]; then
  source "$HOME/.cargo/env"
fi
```

`.zshenv` 会被所有 zsh 进程读取，包括脚本和非交互式 shell。因此不要把 Oh My Zsh、补全插件或耗时命令放在这里，否则会增加每个 zsh 进程的启动成本。

## `~/.zprofile`：登录环境

Apple Silicon Mac 的 Homebrew 默认安装在 `/opt/homebrew`。可以在 `.zprofile` 中初始化 Homebrew，并加入登录后都需要使用的命令路径：

```zsh
# Homebrew
if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# pipx 和 Obsidian 命令
export PATH="$HOME/.local/bin:$PATH"
export PATH="/Applications/Obsidian.app/Contents/MacOS:$PATH"
```

使用 `-x` 判断可以避免在没有安装 Homebrew 的机器上启动时报错。Intel Mac 的 Homebrew 路径通常是 `/usr/local/bin/brew`，需要根据实际安装位置调整。

## `~/.zshrc`：完整交互式配置

下面是当前配置整理后的完整版本。配置顺序很重要：先加载 Oh My Zsh，再配置工具路径和补全，最后加载历史命令提示插件。

```zsh
# Oh My Zsh
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="robbyrussell"
plugins=(git history-substring-search)

source "$ZSH/oh-my-zsh.sh"

# 历史记录
HISTFILE="$HOME/.zsh_history"
HISTSIZE=50000
SAVEHIST=10000
setopt EXTENDED_HISTORY
setopt SHARE_HISTORY
setopt HIST_EXPIRE_DUPS_FIRST
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
setopt HIST_FIND_NO_DUPS

# 开发工具路径
export PATH="$HOME/.local/bin:$PATH"

# zsh 原生补全和 Grok 自定义补全
autoload -Uz compinit
compinit -C

# 外部工具环境变量
export ENABLE_TOOL_SEARCH=false

# 历史命令灰色提示
if [[ -r /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh ]]; then
  source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
fi
```

### 主题和插件

```zsh
ZSH_THEME="robbyrussell"
plugins=(git history-substring-search)
source "$ZSH/oh-my-zsh.sh"
```

`git` 提供 Git 相关别名和提示，`history-substring-search` 会接管上下方向键，让它们根据当前输入内容搜索历史命令。插件列表中的名称必须对应 Oh My Zsh 的插件目录。

### 历史记录

```zsh
HISTFILE="$HOME/.zsh_history"
HISTSIZE=50000
SAVEHIST=10000
```

三者分别表示历史文件位置、内存中保留的历史数量以及写入文件的历史数量。几个 `setopt` 选项用于保留扩展信息、跨 shell 共享历史、忽略重复命令和忽略以空格开头的命令。

历史记录配置解决的是“保存命令”，而不是“如何补全命令”。在此基础上，才可以使用历史搜索和自动提示功能。

### PATH 和工具环境

当前配置包含以下开发工具：

- Bun：通过 `BUN_INSTALL` 和 Bun 的补全脚本初始化；
- Node.js 24：加入 `/opt/homebrew/opt/node@24/bin`；
- PostgreSQL 17：加入 PostgreSQL 客户端命令；
- pipx：使用 `$HOME/.local/bin`；
- Antigravity 和 Grok：加入各自的命令目录；
- Obsidian：在 `.zprofile` 中加入命令路径。

PATH 的顺序会影响同名命令的优先级。例如 Node.js 24 的路径放在前面时，执行 `node` 时会优先使用 Node.js 24。配置多个工具时，应尽量避免在 `.zprofile`、`.zshrc` 和 `.profile` 中重复追加同一个目录。

### `fpath`、`compinit` 和 `Tab` 补全

```zsh
fpath=("$HOME/.grok/completions/zsh" $fpath)
autoload -Uz compinit
compinit -C
```

`fpath` 是 zsh 查找补全函数的目录列表。将自定义补全目录放到 `fpath` 后，`compinit` 才能发现并加载其中的补全函数。

`compinit -C` 会初始化 zsh 的补全系统。它负责命令、参数、选项和文件路径的 `Tab` 补全，但不会自动显示历史命令提示。

### 历史命令灰色提示

```zsh
if [[ -r /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh ]]; then
  source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
fi
```

`zsh-autosuggestions` 会根据历史记录，在当前输入行的末尾显示灰色建议。输入命令前缀后按 `→`，即可接受整条建议。

这个插件应该放在配置文件末尾加载，避免被后续的补全或 ZLE 配置覆盖。如果使用其他 Homebrew 安装路径，也可以写成：

```zsh
source "$(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh"
```

## 四种补全方式的区别

完整配置后，终端中会同时存在四种不同的补全能力：

| 操作 | 提供者 | 用途 |
| --- | --- | --- |
| 按 `Tab` | zsh `compinit` | 补全命令、参数、选项和路径 |
| 输入命令时的灰色文字 | `zsh-autosuggestions` | 根据历史命令预测后续内容 |
| 输入部分内容后按 `↑/↓` | `history-substring-search` | 搜索包含当前输入的历史命令 |
| Bun、Grok 等工具专属补全 | 自定义 `fpath` 或工具脚本 | 补全工具自身的参数和子命令 |

例如以前执行过：

```bash
pnpm run content:lint
```

再次输入 `pnpm` 时，自动提示插件会显示剩余部分；按 `→` 接受建议，或者按 `↑` 搜索其他包含 `pnpm` 的历史命令。

## 让配置生效

修改启动文件后，推荐重新启动当前 zsh：

```bash
exec zsh
```

与反复执行 `source ~/.zshrc` 相比，`exec zsh` 会创建一个干净的交互式 shell，可以避免插件和补全函数被重复加载。

## 配置检查

可以使用以下命令检查配置和工具是否正常：

```bash
# 检查 zsh 配置语法
zsh -n ~/.zshrc

# 查看当前 zsh 版本
zsh --version

# 查看 PATH 中的每一项
print -l $path

# 检查历史提示插件是否安装
brew list zsh-autosuggestions

# 查看当前使用的命令路径
which node
which psql
which bun
```

如果 `Tab` 补全失效，可以检查 `compinit` 是否成功执行，以及自定义补全目录是否已经加入 `fpath`。如果灰色提示失效，则检查 Homebrew 插件文件是否存在：

```bash
ls -l "$(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh"
```

## 总结

一套完整的 zsh 配置可以按职责拆分：

1. `.zshenv` 放置所有 zsh 都需要的基础环境；
2. `.zprofile` 放置登录 shell 的 Homebrew 和系统工具配置；
3. `.zshrc` 放置 Oh My Zsh、历史记录、PATH、补全和交互插件；
4. `compinit` 提供标准 `Tab` 补全；
5. `zsh-autosuggestions` 提供行内历史命令提示；
6. `history-substring-search` 提供上下方向键历史搜索。

这样既能保持配置结构清晰，也能让开发工具、命令补全和历史命令复用在同一个 shell 环境中稳定工作。
