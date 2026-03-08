---
title: 'LangChain Prompt 入门：从 PromptTemplate 到 FewShotPromptTemplate'
description: '本文介绍 LangChain 中 Prompt 的核心概念，以及 PromptTemplate、ChatPromptTemplate、MessagesPlaceholder、FewShotPromptTemplate 和 PipelinePromptTemplate 的基本用法。'
publishedAt: 2026-03-09
tags:
  - AI
  - LangChain
  - Prompt
  - LLM
slug: langchain-prompt
isPublish: true
category: '其他'
---

写 LangChain 时，很多人一开始会把 Prompt 理解成“发给模型的一段字符串”。

这不算错，但太粗了。

在 LangChain 里，Prompt 更像是一个**可组合、可复用、可注入上下文的输入层**。它不只是写一句提示词，而是在组织：

- system 指令
- 用户输入
- 历史消息
- 变量插槽
- few-shot 示例

也正因为这样，LangChain 才会单独提供一套 Prompt API，而不是让你全靠字符串拼接。

## 为什么 LangChain 要单独抽象 Prompt？

先看最原始的写法：

```ts
const prompt = `
你是一个前端导师。
请用中文解释 ${topic}，并给出一个例子。
`
```

这种写法的问题很明显：

- 变量一多就容易乱
- system、human、history 混在一起，不利于维护
- 不方便做复用
- 不方便把 Prompt 接到后续的 chain 里

LangChain 的思路是把 Prompt 变成“模板对象”，这样你就可以像写函数一样去组织输入。

## 1. PromptTemplate：最基础的字符串模板

如果你面对的是**单段文本 Prompt**，最常用的就是 `PromptTemplate`。

```ts
import { PromptTemplate } from '@langchain/core/prompts'

const prompt = PromptTemplate.fromTemplate(`
你是一个技术写作者。
请用中文介绍 {topic}。
要求：
1. 语言通俗
2. 给出一个简单例子
3. 最后补一段总结
`)

const formattedPrompt = await prompt.format({
  topic: '什么是闭包',
})

console.log(formattedPrompt)
```

这里的重点有两个：

- `{topic}` 是模板变量
- `format()` 会把变量填进去，生成最终文本

如果你的场景是“把一段文本交给模型”，那 `PromptTemplate` 已经够用了。

## 2. ChatPromptTemplate：面向聊天模型的主力

现在大部分模型都不是纯文本接口，而是 **message 列表接口**。这时更常用的是 `ChatPromptTemplate`。

```ts
import { ChatPromptTemplate } from '@langchain/core/prompts'

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个资深前端工程师，回答时要准确、简洁。'],
  ['human', '请解释 {topic}，并给出一个 {language} 例子。'],
])

const messages = await prompt.invoke({
  topic: '防抖和节流的区别',
  language: 'JavaScript',
})
```

和 `PromptTemplate` 相比，`ChatPromptTemplate` 的优势是结构更清晰：

- `system` 负责设定角色和规则
- `human` 负责承载用户问题
- 后续还可以插入 `ai`、`tool`、历史消息等内容

这也是为什么在真实项目里，`ChatPromptTemplate` 通常比 `PromptTemplate` 更常见。

## 3. MessagesPlaceholder：把历史对话塞进 Prompt

做多轮对话时，光有 system 和 human 还不够，你通常还需要把历史消息一起传给模型。

这时可以用 `MessagesPlaceholder`：

```ts
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个中文 AI 助手，请结合上下文连续回答。'],
  new MessagesPlaceholder('history'),
  ['human', '{question}'],
])

const messages = await prompt.invoke({
  history: [
    new HumanMessage('什么是 LangChain？'),
    new AIMessage('LangChain 是一个用于构建 LLM 应用的开发框架。'),
  ],
  question: '那 PromptTemplate 是做什么的？',
})
```

这里的 `history` 就像一个插槽。

你可以在运行时把数据库、内存、会话缓存里保存的历史消息注入进去，而不用手动拼接整段上下文。这样做有两个直接好处：

- Prompt 结构更固定
- 历史数据和模板本身解耦

## 4. FewShotPromptTemplate：先给模型看几个例子

有些任务里，光写规则还不够，你还想先给模型几个“标准答案示例”，让它照着这个模式来做。

这时可以用 `FewShotPromptTemplate`。

它的核心结构通常是：

- `prefix`：前置说明
- `examples` 或 `exampleSelector`：示例数据
- `examplePrompt`：每个示例怎么格式化
- `suffix`：真正要模型处理的问题

它最适合那种“输出格式比知识本身更重要”的任务，比如：

- 文本分类
- 信息抽取
- 固定格式改写
- 结构化输出

```ts
import { FewShotPromptTemplate, PromptTemplate } from '@langchain/core/prompts'

const examplePrompt = PromptTemplate.fromTemplate('输入: {input}\n输出: {output}')

const prompt = new FewShotPromptTemplate({
  examples: [
    { input: '开心', output: '难过' },
    { input: '高', output: '矮' },
  ],
  examplePrompt,
  prefix: '请输出词语的反义词。',
  suffix: '输入: {word}\n输出:',
  inputVariables: ['word'],
})

const result = await prompt.format({
  word: '快',
})

console.log(result)
```

最终生成出来的 Prompt 会先包含两组示例，再接上真正的问题。

### `examples` 和 `exampleSelector` 有什么区别？

- `examples`：直接写死一组示例
- `exampleSelector`：根据当前输入动态挑选更合适的示例

如果你的示例数量不多，直接用 `examples` 就行。
如果示例很多，或者不同输入需要匹配不同案例，就更适合 `exampleSelector`。

一句话理解：**`FewShotPromptTemplate` 解决的是“先示范，再让模型照着做”问题。**

## 5. PipelinePromptTemplate：把多个子 Prompt 组装起来

如果你的 Prompt 不是“一整段一次写完”，而是由多个可复用片段拼出来的，那么还可以看看 `PipelinePromptTemplate`。

它的核心思路是：

- 先定义几个中间 Prompt
- 分别格式化这些 Prompt
- 再把它们的输出作为变量，注入最终 Prompt

可以把它理解成“Prompt 的模板组合器”。

```ts
import { PipelinePromptTemplate, PromptTemplate } from '@langchain/core/prompts'

const introductionPrompt = PromptTemplate.fromTemplate(
  '你是一个擅长讲解 {topic} 的技术作者。'
)

const requirementPrompt = PromptTemplate.fromTemplate(`
写作要求：
1. 面向 {audience}
2. 使用中文
3. 给出一个简单示例
`)

const finalPrompt = PromptTemplate.fromTemplate(`
{introduction}

{requirements}

现在请输出一段关于 {topic} 的介绍。
`)

const pipelinePrompt = new PipelinePromptTemplate({
  pipelinePrompts: [
    { name: 'introduction', prompt: introductionPrompt },
    { name: 'requirements', prompt: requirementPrompt },
  ],
  finalPrompt,
})

const result = await pipelinePrompt.format({
  topic: 'LangChain Prompt',
  audience: '前端初学者',
})

console.log(result)
```

上面这段代码做的事其实很直接：

1. 先生成 `introduction`
2. 再生成 `requirements`
3. 最后把这两个结果拼进 `finalPrompt`

这样做的好处是，你可以把一些高频片段单独抽出来复用，比如：

- 固定角色设定
- 固定输出规范
- 固定 few-shot 示例块
- 不同业务共用的开场说明

### 它和直接字符串拼接有什么区别？

区别不在“能不能拼起来”，而在“拼完之后还好不好维护”。

如果你只是偶尔组合两三段文本，直接写一个 `PromptTemplate` 也完全可以。
但如果一个 Prompt 里有很多可复用模块，`PipelinePromptTemplate` 会更清晰，因为每个片段都可以独立维护。

### 它适合什么场景？

更适合：

- Prompt 片段有明显复用价值
- 想把“角色”“约束”“示例”拆成独立模块
- 同一个最终 Prompt 需要按不同组合方式拼装

不一定适合：

- 结构很简单的单轮 Prompt
- 本身就是聊天消息结构的场景

一句话理解：**`PipelinePromptTemplate` 解决的是“Prompt 片段复用和组装”问题。**

## 6. Prompt 在 LangChain 里的位置

很多人学 LangChain 时容易把 Prompt 和模型混为一谈。实际上它们是两层东西：

- Prompt 负责组织输入
- Model 负责生成输出

一个很常见的组合方式是：

```ts
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个技术博客编辑。'],
  ['human', '请写一段关于 {topic} 的简介，控制在 120 字以内。'],
])

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
})

const chain = prompt.pipe(model)

const result = await chain.invoke({
  topic: 'LangChain Prompt',
})

console.log(result.content)
```

可以把它理解成一条流水线：

`输入变量 -> Prompt 模板 -> 消息列表 -> 模型输出`

Prompt 并不负责“思考”，它只负责把输入整理成模型更容易理解的形状。

## 7. 什么时候用哪一种 Prompt？

可以简单这样判断：

### 用 `PromptTemplate`

适合：

- 文本生成
- 单轮任务
- 不区分 system / human 角色的场景

例如：

- 文本分类
- 摘要生成
- 固定格式改写

### 用 `ChatPromptTemplate`

适合：

- 聊天模型
- 多角色消息结构
- 需要拼接历史消息、工具消息的场景

例如：

- AI 助手
- 问答机器人
- Agent 工作流

### 用 `FewShotPromptTemplate`

适合：

- 需要给模型示范标准输出
- 希望提升格式一致性
- 同一类任务有明确的样例可参考

例如：

- 情感分类
- 标签抽取
- 摘要改写
- 结构化输出

### 用 `PipelinePromptTemplate`

适合：

- Prompt 由多个模块拼装而成
- 希望复用通用片段
- 想把长 Prompt 拆成可维护的几段

例如：

- 统一角色设定 + 统一约束 + 业务问题
- 多套模板共享同一段输出规范
- 需要复用固定示例块的内容生成场景

一句话总结：

- 聊天模型优先考虑 `ChatPromptTemplate`
- 单段文本优先考虑 `PromptTemplate`
- 需要示例驱动时使用 `FewShotPromptTemplate`
- 需要模块化组装时再考虑 `PipelinePromptTemplate`

## 8. 一个更实用的 Prompt 设计思路

很多 Prompt 写不好，不是因为 LangChain 难，而是因为输入层没有拆清楚。一个比较稳的写法通常是：

### 角色

先告诉模型“你是谁”。

```text
你是一个技术导师，擅长用中文解释前端概念。
```

### 任务

明确告诉模型“要做什么”。

```text
请解释 React 中的受控组件。
```

### 约束

告诉模型“输出应当满足什么条件”。

```text
要求：
1. 控制在 200 字以内
2. 给出一个代码示例
3. 不要使用过于学术化的表述
```

### 上下文

补充必要背景，而不是把所有资料一股脑扔进去。

```text
读者是刚入门前端的开发者。
```

把这四层拆开之后，你的 Prompt 往往会稳定很多。LangChain 的模板机制，本质上就是帮助你把这些部分组织起来。

如果这几个部分本身还需要复用，你就可以进一步把它们拆成多个子模板，再交给 `PipelinePromptTemplate` 统一组装。

## 9. 常见问题

### PromptTemplate 和 ChatPromptTemplate 谁更高级？

不是“谁更高级”，而是“谁更适合”。

如果模型接口本身就是消息列表，那么 `ChatPromptTemplate` 会更自然。

### MessagesPlaceholder 是不是记忆系统？

不是。

它只是一个**占位符**，负责把你准备好的历史消息插进 Prompt。
真正的记忆来自哪里，取决于你自己的会话存储方案。

### PipelinePromptTemplate 和 LCEL 的 `pipe` 是一回事吗？

不是。

- `PipelinePromptTemplate` 是在**Prompt 内部**组织多个模板
- `pipe` 是把**不同 runnable** 串成执行链

前者解决“怎么生成一个最终 Prompt”，后者解决“Prompt 生成后怎么继续流向模型、解析器或下游步骤”。

可以简单记成：

- `PipelinePromptTemplate` 管模板组合
- `pipe` 管执行流程

### FewShotPromptTemplate 和 PipelinePromptTemplate 能一起用吗？

可以。

两者解决的问题不同：

- `FewShotPromptTemplate` 负责提供示例
- `PipelinePromptTemplate` 负责拼装模块

如果你的最终 Prompt 既需要可复用片段，又需要 few-shot 示例，完全可以把 few-shot 部分作为一个子模板，再交给 `PipelinePromptTemplate` 统一组合。

### LangChain 的 Prompt API 会不会经常变？

会有版本差异，尤其是包路径、组合方式和部分运行时 API。

但核心思路基本不变：

- 用模板表达变量
- 用消息表达角色
- 用占位符注入上下文

所以学习时不要只记具体方法名，更要理解这套抽象。

## 结语

LangChain 里的 Prompt，不只是“写一句提示词”，而是在搭建模型的输入结构。

如果你刚开始接触 LangChain，建议按这个顺序学习：

1. 先掌握 `PromptTemplate`
2. 再理解 `ChatPromptTemplate`
3. 学会用 `MessagesPlaceholder` 组织多轮上下文
4. 需要示例驱动时，补 `FewShotPromptTemplate`
5. 需要模块化复用时，再补 `PipelinePromptTemplate`

把这几件事吃透后，你再去看链式调用、RAG、Agent，理解成本会低很多。
