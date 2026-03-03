---
title: 'Agentic AI：从“会回答”到“会执行”'
description: '本文参考吴恩达对 Agentic AI 的公开分享，梳理 Agentic 工作流、核心能力、落地路径与实践建议。'
publishedAt: 2026-03-03
tags:
  - AI
  - Agentic AI
  - LLM
slug: agentic-ai-andrew-ng
isPublish: true
category: '其他'
---

在吴恩达（Andrew Ng）对 Agentic AI 的分享里，一个核心观点非常清晰：
**让模型多想几步、做几步，往往比单次提示更有效。**

传统聊天式 AI 更像“问答器”，而 Agentic AI 更像“执行者”。
它不是只生成一次答案，而是进入一个循环：**理解任务 → 制定步骤 → 调用工具 → 检查结果 → 继续迭代**。

## 什么是 Agentic AI？

可以把 Agentic AI 理解为一种“带工作流的 AI 系统”：

- 它有目标，而不是只回复一句话
- 它会分解任务，而不是一次性硬答
- 它能使用工具（搜索、代码执行、数据库、API）
- 它会根据中间结果修正下一步动作

这类系统通常比“单轮提示”更稳定，尤其适合复杂任务，例如：数据分析、自动化编程、长流程运营、研究型检索等。

## 吴恩达强调的 4 类 Agentic 模式

### 1. Reflection（反思）

先产出初稿，再自我检查并改进。

例如写文章时，先生成结构，再让模型检查“是否有逻辑跳跃、是否遗漏关键点”，再二次改写。很多任务的质量提升，来自这一步。

### 2. Tool Use（工具使用）

让模型不只“想”，还能“做”。

比如把计算交给 Python，把实时信息交给搜索，把业务动作交给内部 API。模型负责决策与编排，工具负责精确执行。

### 3. Planning（规划）

先做计划，再执行。

对于长任务，先拆成子任务（里程碑、依赖关系、验收标准），可以显著降低中途跑偏的概率，也更容易监控进度。

### 4. Multi-Agent Collaboration（多智能体协作）

把复杂任务拆给不同角色的 Agent：

- Research Agent：负责信息收集
- Builder Agent：负责实现
- Reviewer Agent：负责审查

这种方式在复杂项目中更可控，但也会增加系统编排成本。

## 一个最小 Agent 循环（示意）

```ts
async function runAgent(task: string) {
  let state = { task, attempts: 0, done: false, context: [] as string[] }

  while (!state.done && state.attempts < 5) {
    const plan = await think(state)
    const actionResult = await act(plan) // 调用搜索/API/代码执行等工具
    const review = await reflect(state, actionResult)

    state.context.push(actionResult.summary)
    state.done = review.pass
    state.attempts += 1
  }

  return state
}
```

重点不在“循环本身”，而在每一轮都有明确的输入、动作和验收标准。

## 什么时候该用 Agentic AI？

适合：

- 任务步骤多、一次答不完
- 需要调用外部工具或系统
- 结果需要可追踪、可复盘

不适合：

- 非常简单的一次性问答
- 对延迟极其敏感且容错很低的场景

## 自主性程度：从助手到自动执行

在设计 Agentic AI 时，一个关键决策是“给它多大自主权”。可以用 5 个层级快速判断：

- L0（无自主）：仅问答，不执行动作
- L1（建议型）：给出步骤建议，由人类手动执行
- L2（半自动）：可调用工具执行，但关键步骤需人工确认
- L3（条件自动）：在明确规则和边界内自动完成任务，异常时回退人工
- L4（高自主）：端到端自动执行，只在高风险节点通知人工

实践里，很多团队直接追求 L4，结果经常是成本高、稳定性差。更可行的路径通常是：

1. 先从 L1 或 L2 起步，先把流程跑通
2. 用日志和评估指标定位高失败环节
3. 逐步把可控环节提升到 L3
4. 仅在低风险、可回滚任务上尝试 L4

一句话总结：**自主性越高，收益越大，但治理成本也越高。**

## 落地建议：先小后大

结合吴恩达的实践思路，落地时建议按这个顺序推进：

1. 选一个高价值且边界清晰的小场景
2. 先做单 Agent + 2~3 个核心工具
3. 增加反思与评估环节（而不是盲目加模型）
4. 记录轨迹与失败案例，持续迭代提示词和流程
5. 最后再考虑多 Agent 协作

很多团队一上来就做“全自动多智能体平台”，往往复杂度过高。先把单条工作流打通，通常收益更快。

## 结语

Agentic AI 的本质不是“换了一个更大的模型”，而是把 AI 从“回答问题”升级为“完成任务”的系统能力。

如果你正在做 AI 应用，下一步不妨从一个可衡量的小任务开始：
让模型不仅会说，更会做，并且做完可检查、可复现、可优化。

---

参考：吴恩达关于 Agentic AI 的公开课程与分享（DeepLearning.AI）。
