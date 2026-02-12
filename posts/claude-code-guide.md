---
title: 'Claude Code 入门指南'
description: 'Claude Code 是由 Anthropic 推出的通用的命令行代理（Agent），本文介绍了它的核心功能、安装方法以及高效使用技巧。'
publishedAt: 2026-01-02
tags:
  - AI
  - Claude
  - Tools
slug: claude-code-guide
isPublish: true
category: '其他'
---

## 什么是 Claude Code？

<a href="https://code.claude.com/docs/zh-CN/overview" target="_blank">Claude Code</a> (简称 CC) 是由 Anthropic 推出的一款**通用型终端代理 (General Agent)**。

如果你觉得它只是另一个类似 Copilot 的代码补全工具，那就大错特错了。CC 的核心逻辑是 **“以文件夹为中心”** 的智能体。它不是寄生在编辑器里的插件，而是直接在你的终端中运行，拥有直接操作本地文件系统、执行终端命令、甚至进行网络搜索的“实体”能力。

### 核心哲学：从“对话框”到“本地代理”

传统的 AI 工具通常被限制在一个虚拟的对话框内，你必须不断地“复制-粘贴”代码。而 Claude Code 标志着一种**质变**：

- **它有逻辑**：它能自动理解整个项目的结构。
- **它有权限**：它能帮你创建文件、修改代码、运行测试。
- **它有上下文**：一旦进入某个文件夹，它就自动获得了该领域的所有背景。

---

## 核心特性

- **🚀 零配置启动**：无需复杂的 YAML 配置或环境 setup，安装即用。
- **📂 文件夹级人格**：它会根据当前目录动态调整“职业倾向”。在科研目录里是 Research Assistant，在开发目录里是 Senior Engineer。
- **⚡️ 深度交互**：直接在终端输入指令，响应迅速，支持复杂的链式任务。
- **🌐 全能选手**：除了写代码，它还能处理数据清洗、音视频自动化处理、甚至抓取网页进行深度分析。

---

## 如何安装与配置？

由于 Claude Code 是跨平台的，你可以根据自己的操作系统选择最适合的安装方式。

### 🍎 macOS 环境

macOS 用户拥有最优化的安装路径，官方现已支持通过 Homebrew 直接安装，不再强制依赖 Node.js 环境：

1. **Homebrew 安装 (推荐)**：

    ```bash
    brew install claude-code
    ```

2. **npm 命令行安装**：
    如果你已安装 Node.js，也可以通过 npm 全局安装：

    ```bash
    npm install -g @anthropic-ai/claude-code
    ```

3. **权限配置**：首次运行建议在“系统设置 > 隐私与安全性 > 终端/文件和文件夹”中赋予相应权限，以确保 CC 能正常读写项目。

### 🪟 Windows 环境

1. **命令行安装**：

    ```powershell
    npm install -g @anthropic-ai/claude-code
    ```

    _建议配合 WSL2 使用，以获得更接近 Linux 的原生开发体验。_

### 🐧 Linux 环境

1. **命令行安装**：

    ```bash
    sudo npm install -g @anthropic-ai/claude-code
    ```

2. **环境变量**：确保你的 `PATH` 中包含了 npm 的全局 bin 目录。

---

> ⚠️ **入门配置：API Key**
> 无论在哪种环境下，你都需要设置 `ANTHROPIC_API_KEY` 环境变量，或者在首次启动时根据交互提示输入你的 Key。安装完成后，只需在终端输入 `claude` 即可开启对话。

### 🚀 进阶：接入国产大模型 Kimi K2

官方的 CC 丧心病狂，封号严重，国内对 CC 模型支持比较好的有三个：GLM 4.7，MiniMax M2.1，Kimi K2。

如果你希望在 Claude Code 中使用国产大模型 Kimi K2，可以通过官方提供的 API 兼容能力轻松实现。Kimi K2 的 API 现在支持 Anthropic 协议，允许你绕过地域限制或享受更具成本效益的体验。

> **注意**：
> Kimi K2 对未充值的用户有<a href="https://platform.moonshot.cn/docs/pricing/limits#%E9%99%90%E9%80%9F%E6%A6%82%E5%BF%B5%E8%A7%A3%E9%87%8A" target="_blank">Token使用限制</a>，为了更好的使用建议充值50元。

**接入步骤：**

1. **获取 Key**：前往 <a href="https://platform.moonshot.cn/" target="_blank">Moonshot AI 开放平台</a> 申请 API Key。
2. **配置环境变量**：在你的 Shell 配置文件（如 `.zshrc` 或 `.bashrc`）中添加以下配置：

    ```bash
    # 设置 Kimi 的 Anthropic 兼容端点
    export ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"
    # 设置你的 Kimi API Key
    export ANTHROPIC_API_KEY="你的-Kimi-API-Key"
    ```

3. **生效配置**：运行 `source ~/.zshrc`（以 zsh 为例），随后再次输入 `claude`，你的 Claude Code 就会由 Kimi K2 引擎驱动。

### ⚠️ 危险模式 (Dangerous Mode/YOLO Mode)

在默认情况下，Claude Code 每执行一个写文件或运行命令的操作，都会弹出权限提示要求你确认。虽然这很安全，但在处理如“修复全项目 Lint 错误”这种需要上百次操作的任务时，频繁的确认会让人陷入“审美疲劳”。

为此，官方提供了一个标志位：`--dangerously-skip-permissions`，也被社区戏称为 **YOLO 模式**。

**如何开启：**
在启动时附加标志：

```bash
claude --dangerously-skip-permissions
```

**它的风险：**

- **不可逆的破坏**：CC 可能会误删你的核心文件或清空主目录。
- **系统安全问题**：不受控的脚本执行可能导致系统损坏。
- **提示词注入风险**：如果 CC 正在读取恶意代码，攻击者可能诱导它执行危险指令。

**最佳实践：**

1. **沙盒运行**：强烈建议在 Docker 容器或独立的虚拟机中开启此模式。
2. **Git 为先**：开启前务必确保当前所有代码都已 `git commit`。
3. **小范围测试**：只在自动化任务明确且范围可控的文件夹内使用。

---

### 🧩 Claude Skills：自定义你的 AI 能力

<https://github.com/anthropics/skills>

如果你觉得 Claude Code 的默认能力还不足以应对复杂的特定业务逻辑，你可以通过 **Skills** 机制来“调教”它。这相当于为你的 AI 助手定制了一套专属的工具箱。

#### 1. 使用 `SKILL.md` 定义文件夹级技能

你可以在特定目录下放置一个 `SKILL.md` 文件。当 Claude Code 进入该目录时，它会优先读取该文件。你可以在其中定义：

- **操作规范**：例如，“在本目录下修改代码后必须运行 `npm test`”。
- **知识库**：该目录相关的业务背景、API 文档摘要等。
- **常用指令**：告诉 Claude 遇到什么问题该调用哪些脚本。

#### 2. 自定义斜杠命令 (Slash Commands)

你可以通过在项目目录下的 `.claude/commands` 文件夹中创建 Markdown 文件来自定义命令。

- **文件命名即命令**：创建一个 `optimize.md`，你就拥有了 `/optimize` 指令。
- **声明式工作流**：在 Markdown 中描述该指令应该执行的步骤（如：压缩图片 -> 更新路径 -> 提交记录），Claude 会按照你的描述自动化执行。

#### 3. 全局 Skill 共享

如果你有一些通用的技能（比如特定的 Git 提交流程），可以在全局配置目录（通常是 `~/.claude/`）中进行统一定义，实现跨项目的技能复用。

---

## 高效进阶技巧

### 1. 保持“文件夹边界感”

不要在一个巨大的根目录下启动 CC。**最好的做法是为每一个子任务创建一个独立的文件夹**。

- 比如：你要处理 100 张工资单，就把它们扔进 `payroll_processing` 文件夹。
- 这样能让 CC 的“注意力”更加集中，极大减少幻觉并提高成功率。

### 2. 结合 Git 进行“安全驾驶”

CC 会直接修改你的源码。**强力建议在 Git 仓库内使用它**：

- 在让 CC 执行大规模修改前，确保当前工作区是干净的。
- 修改完成后，通过 `git diff` 快速审阅 CC 的改动。

### 3. 定义 CLAUDE.md

在项目根目录创建一个 `CLAUDE.md` 文件。在这里写下你的代码风格偏好、常用构建命令或特定业务逻辑。CC 在启动时会优先读取这个文件，瞬间完成“岗前培训”。

---

## 适用场景举例

- **快速原型开发**：给它几个 UI 截图，让它在当前目录生成 React 组件。
- **枯燥文档处理**：把几十个 PDF 丢进去，让它提取关键数据并导出为 CSV。
- **音视频自动化**：利用相关脚本，让它通过 CLI 工具帮你批量切割视频或同步字幕。

## 结语

Claude Code 的出现，预示着 AI 正从“副驾驶”向“独立作业员”进化。它不再只是回答问题，而是开始真正替你**接管工作流程**。

---

> 💡 本文内容参考并致敬 <a href="https://x.com/oran_ge/status/2005419365450252425" target="_blank">Orange AI 的 Twitter/X 精华分享</a>。
