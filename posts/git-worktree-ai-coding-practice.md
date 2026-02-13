---
title: 'git worktree + AI Coding 实战：并行开发不串线'
description: '通过一个真实场景演示如何用 git worktree 同时推进新功能与紧急修复，并结合 AI Coding 提升交付效率。'
publishedAt: 2026-02-13
tags:
  - Git
  - AI Coding
  - 工程实践
slug: git-worktree-ai-coding-practice
isPublish: true
category: '其他'
---

当你一边在做新功能，一边又被线上紧急 Bug 打断时，最常见的问题是：分支切来切去、上下文丢失、改动互相污染。

`git worktree` 的价值是“一个仓库，多个工作目录”，而 AI Coding 的价值是“在当前上下文里快速产出和验证代码”。两者组合后，能明显减少切换成本。

## 场景设定

- 任务 A：开发“文章推荐卡片”功能
- 任务 B：紧急修复移动端导航样式错位
- 目标：两个任务并行推进，互不干扰

## 第 1 步：准备主仓库

先确保主分支状态干净且最新：

```bash
git status
git switch main
git pull --ff-only
```

如果 `git status` 不是 clean，请先提交或暂存当前改动，再继续。

## 第 2 步：创建两个 worktree

默认在当前工作区下使用 `.worktrees` 目录管理 worktree：

```bash
mkdir -p .worktrees
git worktree add .worktrees/feat-recommend-card -b feat/recommend-card
git worktree add .worktrees/fix-mobile-nav -b fix/mobile-nav
```

执行后你会得到两个独立目录：

- `.worktrees/feat-recommend-card`：只处理新功能
- `.worktrees/fix-mobile-nav`：只处理紧急修复

查看当前 worktree 列表：

```bash
git worktree list
```

## 第 3 步：在每个 worktree 内做 AI Coding

关键原则：**一个 worktree 只让 AI 处理一个任务**。

### 3.1 修复分支（高优先级）

先进入修复目录并启动你的 AI 编码助手（按你本机工具实际命令执行）：

```bash
cd ./.worktrees/fix-mobile-nav
git status
```

可以直接给 AI 一个明确约束的任务描述：

> 只修复移动端导航错位，不改动桌面端样式；修改后运行 `bun run check`；最后给出变更文件和风险点。

修复完成后提交：

```bash
git add -A
git commit -m "fix: 修复移动端导航错位"
```

### 3.2 功能分支（并行推进）

切换到功能目录，重复同样流程：

```bash
cd ./.worktrees/feat-recommend-card
git status
```

给 AI 的任务描述建议包含“范围”和“验收标准”：

> 在文章详情页增加推荐卡片；不修改内容 schema；保持现有样式体系；完成后运行 `bun run check` 并说明结果。

实现完成后提交：

```bash
git add -A
git commit -m "feat: 添加文章推荐卡片"
```

### 3.3 在 AI Coding 中配合 `using-git-worktrees` skill

如果你在用支持 Skills 的 AI 编码工具，可以直接接入这个现成流程：

- 技能页：<https://skills.sh/obra/superpowers/using-git-worktrees>
- 安装命令：

```bash
npx skills add https://github.com/obra/superpowers --skill using-git-worktrees
```

这个 skill 的价值是把 `worktree` 使用流程标准化，尤其适合多任务并行时避免“目录混乱”和“误操作”：

1. 目录选择有优先级
优先使用现有目录（`.worktrees` > `worktrees`）；若都不存在，再看项目约定文件（如 `AGENTS.md` / `CLAUDE.md`），最后再询问团队约定，避免路径不一致。

2. 创建前先做忽略校验
项目内目录建议先检查是否被 Git 忽略，避免把 worktree 内容误纳入版本控制：

```bash
git check-ignore -q .worktrees || git check-ignore -q worktrees
```

3. 创建后先做基线验证
进入新 worktree 后先跑项目校验，确认基线是干净的，再让 AI 开始改代码：

```bash
bun install --frozen-lockfile
bun run check
```

对于本项目，推荐固定使用 `.worktrees/`，并把“先校验再编码”作为每个 worktree 的默认步骤。

## 第 4 步：按优先级合并

通常先合并修复，再合并功能：

```bash
cd -
git switch main
git pull --ff-only
git merge --ff-only fix/mobile-nav
git merge --no-ff feat/recommend-card
```

如果修复分支已上线但功能还要继续打磨，也可以只先合并 `fix/mobile-nav`。

## 第 5 步：清理 worktree

分支合并后，及时清理目录，避免后续误用：

```bash
git worktree remove ./.worktrees/fix-mobile-nav
git worktree remove ./.worktrees/feat-recommend-card
git branch -d fix/mobile-nav
git branch -d feat/recommend-card
git worktree prune
```

## `git worktree` 常用命令与参数速查

`git worktree` 可以理解为“主仓库 + 多个物理工作目录”，每个目录可检出不同分支。

常用子命令：

- `git worktree add <path> [<commit-ish>]`：创建新 worktree
- `git worktree list [-v | --porcelain [-z]]`：查看 worktree 列表
- `git worktree remove [-f] <worktree>`：移除 worktree
- `git worktree prune [-n] [-v] [--expire <time>]`：清理失效的 worktree 元数据
- `git worktree move <worktree> <new-path>`：移动 worktree 目录
- `git worktree lock [--reason <string>] <worktree>`：锁定 worktree，防止误删
- `git worktree unlock <worktree>`：解锁 worktree
- `git worktree repair [<path>...]`：修复 worktree 元数据路径异常

`git worktree add` 常用参数：

- `-b <new-branch>`：基于当前 `HEAD`（或你给的 `<commit-ish>`）创建并检出新分支
- `-B <branch>`：强制重建并检出分支（会重置到起点，谨慎使用）
- `--detach`：不检出分支，直接使用 detached HEAD
- `--orphan`：创建孤儿分支（无父提交历史）
- `-f`：强制执行（例如目标路径已存在时）
- `--lock [--reason <string>]`：创建后立即锁定，适合长期保留的 worktree

`git worktree add` 常见用例：

1. 从新分支创建（基于当前分支）

```bash
git worktree add .worktrees/feat-recommend-card -b feat/recommend-card
```

如果要明确指定起点（比如从 `main` 拉新分支）：

```bash
git worktree add .worktrees/feat-recommend-card -b feat/recommend-card main
```

2. 从已有本地分支创建

```bash
git worktree add .worktrees/fix-mobile-nav fix/mobile-nav
```

如果该分支已在其他 worktree 检出，默认会失败；确认无风险时可用 `-f` 强制：

```bash
git worktree add -f .worktrees/fix-mobile-nav fix/mobile-nav
```

3. 从已有远程分支创建（本地还没有同名分支）

先拉取远程引用：

```bash
git fetch origin
```

显式创建本地跟踪分支并检出到新 worktree：

```bash
git worktree add --track -b fix/mobile-nav .worktrees/fix-mobile-nav origin/fix/mobile-nav
```

如果你希望 Git 自动猜测远程分支（仅在分支名可唯一匹配时推荐）：

```bash
git worktree add --guess-remote .worktrees/fix-mobile-nav fix/mobile-nav
```

`list / remove / prune` 常用参数：

- `list -v`：显示更详细信息（如锁定状态）
- `list --porcelain -z`：机器可读输出，适合脚本处理
- `remove -f`：强制移除（有未提交改动时需特别谨慎）
- `prune -n`：试运行，不真正删除
- `prune --expire <time>`：只清理早于指定时间的记录（如 `now`、`3.days.ago`）

## 常见坑与规避方式

1. AI 跑错目录
在给 AI 下指令前，先执行一次 `pwd` 和 `git branch --show-current`。

2. 两个任务改到同一文件
高风险文件（如路由、全局样式、共享配置）优先拆成单独 PR，减少冲突。

3. 只看结果不看 diff
无论 AI 产出多快，合并前都要人工检查：

```bash
git diff --stat
git diff
```

## 总结

`git worktree` 解决的是并行开发时的“环境隔离”，AI Coding 解决的是每个环境内的“实现效率”。

把任务边界切清楚，再让 AI 在各自 worktree 内工作，你会得到一个更稳定、可审查、可回滚的交付流程。
