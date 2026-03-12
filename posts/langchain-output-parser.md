---
title: 'LangChain OutputParser：把模型输出变成程序可用的数据'
description: '本文介绍 LangChain 中 OutputParser 的作用、常见类型、与 LCEL 的组合方式，以及什么时候该用解析器、什么时候该用模型原生结构化输出。'
publishedAt: 2026-03-11
tags:
  - AI
  - LangChain
  - OutputParser
  - LLM
slug: langchain-output-parser
isPublish: true
category: '其他'
---

很多人刚开始用 LangChain 时，会把重点放在 Prompt 上。

这很正常，因为 Prompt 决定了你怎么和模型说话。

但真到落地阶段，另一个问题往往更麻烦：**模型回给你的内容，程序到底怎么接？**

比如你希望模型返回：

- 一个字符串摘要
- 一个标签数组
- 一段合法 JSON
- 一个固定字段的数据对象

如果你只是 `console.log(result.content)` 看一眼，感觉一切都挺顺。
可一旦你要把结果继续传给接口、数据库、表单、工作流节点，就会发现“能看懂”不等于“能稳定使用”。

这时候，`OutputParser` 的价值就出来了。

它的作用，不是让模型更聪明，而是让**模型输出更容易被程序消费**。

## 为什么需要 OutputParser？

先看一个最常见的场景。

你让模型输出文章摘要和标签：

```text
请总结下面这篇文章，并返回 3 个标签。
```

模型可能返回：

```text
摘要：这篇文章介绍了 React Server Components 的基本思路。
标签：React、RSC、前端架构
```

这对人来说完全没问题。
但对程序来说，问题很多：

- 字段名可能变成“简介”“总结”“核心观点”
- 标签分隔符可能是顿号、逗号或换行
- 某次响应可能多加一段解释
- 某次响应可能根本不是合法 JSON

也就是说，**自然语言对人友好，但对程序并不稳定**。

LangChain 的思路是：

1. 用 Prompt 明确告诉模型应该输出什么格式
2. 用 OutputParser 在链末尾把结果解析成你真正需要的数据结构

一句话理解：**Prompt 负责约束输出形状，OutputParser 负责把这个形状落成可用数据。**

## OutputParser 是什么？

在 LangChain 里，OutputParser 可以理解成“输出解析层”。

它通常会做两件事：

- 提供格式说明（`getFormatInstructions()`）
- 解析模型返回结果（`parse()`）

典型流程通常是这样：

```text
输入变量 -> PromptTemplate -> ChatModel -> OutputParser -> 结构化结果
```

如果你前面那篇文章已经学过 Prompt，这里其实就只是在流水线末尾再补一层。

## 1. `StringOutputParser`：最简单的文本提取

如果你只是想拿到一段纯文本，而不是 `AIMessage` 这种消息对象，最常见的就是 `StringOutputParser`。

```ts
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatOpenAI } from '@langchain/openai'

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个技术博客编辑。'],
  ['human', '请用中文概括 {topic}，控制在 80 字以内。'],
])

const model = new ChatOpenAI({
  model: 'gpt-5.4',
})

const chain = prompt.pipe(model).pipe(new StringOutputParser())

const result = await chain.invoke({
  topic: 'LangChain OutputParser',
})

console.log(result)
```

这里的重点不是“解析复杂结构”，而是：

- 去掉消息包装层
- 直接拿最终文本
- 让下游拿到稳定的 `string`

如果你的任务只是摘要、改写、生成一段文案，`StringOutputParser` 往往就够了。

### 它和直接读 `result.content` 有什么区别？

区别在于链式组合体验。

如果你手动读 `result.content`，你拿到的是“某次模型调用的结果”。
如果你把 `StringOutputParser` 接进 LCEL 流水线，整个链本身就声明了：**我的最终输出类型是字符串。**

这会让组合和复用都更自然。

## 2. 列表解析器：把一段文本变成数组

有些任务你希望模型返回的是列表，例如：

- 关键词提取
- 标题候选
- TODO 列表
- 标签集合

在 JavaScript / TypeScript 场景里，更稳妥的做法是优先使用你当前版本里明确导出的列表解析器。

本文用 `CommaSeparatedListOutputParser` 举例，因为它的用途最直观：让模型输出逗号分隔结果，再把它解析成数组。

比如你希望模型返回逗号分隔的标签：

```ts
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { CommaSeparatedListOutputParser } from '@langchain/core/output_parsers'
import { ChatOpenAI } from '@langchain/openai'

const outputParser = new CommaSeparatedListOutputParser()

const model = new ChatOpenAI({
  model: 'gpt-5.4',
})

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个内容运营助手。'],
  [
    'human',
    '请为 {topic} 生成 5 个标签。\n{format_instructions}',
  ],
])

const chain = prompt.pipe(model).pipe(outputParser)

const result = await chain.invoke({
  topic: 'LangChain OutputParser',
  format_instructions: outputParser.getFormatInstructions(),
})

console.log(result)
```

最终你拿到的通常是一个字符串数组，而不是一大段难处理的文本。

这里有个很关键的点：
**OutputParser 不只是事后解析，它还会反向影响 Prompt 的写法。**

也就是说，你一般会先创建 parser，再把 `parser.getFormatInstructions()` 塞进 Prompt，告诉模型按这个格式输出。

## 3. `JsonOutputParser`：最实用的通用结构化解析

真实项目里，最常见的需求通常不是“返回一句话”，而是“返回一个对象”。

例如：

```json
{
  "title": "...",
  "summary": "...",
  "tags": ["...", "..."],
  "score": 92
}
```

这类场景里，`JsonOutputParser` 会比纯文本解析更实用。

```ts
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import { ChatOpenAI } from '@langchain/openai'

const outputParser = new JsonOutputParser()

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个技术文章分析助手。'],
  [
    'human',
    `请分析下面的主题，并按要求返回结果：

主题：{topic}

{format_instructions}`,
  ],
])

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
})

const chain = prompt.pipe(model).pipe(outputParser)

const result = await chain.invoke({
  topic: 'LangChain OutputParser',
  format_instructions: `${outputParser.getFormatInstructions()}

请只返回 JSON，不要附加解释，不要使用 Markdown 代码块。
对象包含以下字段：
- title: 字符串
- summary: 字符串
- tags: 字符串数组
- score: 0 到 100 的数字`,
})

console.log(result)
```

`JsonOutputParser` 的价值在于：

- 结果更适合继续传给后端或前端
- 你可以围绕对象结构继续做校验
- 比手写字符串切分更稳

不过它也要注意一点：
**它能解析 JSON，不等于模型一定会老老实实返回完美 JSON。**

所以在实践里，Prompt 仍然要写得足够明确。

## 4. `StructuredOutputParser`：给结构再加一层约束

如果你不只是想要“某个 JSON 对象”，而是希望字段含义更清晰、结构更明确，可以进一步看 `StructuredOutputParser`。

在 JavaScript / TypeScript 场景里，常见写法是基于 Zod schema 来创建：

```ts
import * as z from 'zod'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { ChatOpenAI } from '@langchain/openai'

const schema = z.object({
  title: z.string().describe('文章标题'),
  summary: z.string().describe('文章摘要'),
  tags: z.array(z.string()).describe('文章标签'),
})

const outputParser = StructuredOutputParser.fromZodSchema(schema)

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个技术内容整理助手。'],
  ['human', '请整理 {topic}，并按要求输出。\n{format_instructions}'],
])

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
})

const chain = prompt.pipe(model).pipe(outputParser)

const result = await chain.invoke({
  topic: 'LangChain OutputParser',
  format_instructions: outputParser.getFormatInstructions(),
})

console.log(result)
```

和 `JsonOutputParser` 相比，`StructuredOutputParser` 更像是在说：

- 我不只要 JSON
- 我还要字段结构尽量贴近 schema
- 最好连字段描述都提前告诉模型

一句话理解：**`JsonOutputParser` 更偏“把结果转成 JSON”，`StructuredOutputParser` 更偏“按约定结构生成并解析 JSON”。**

## 5. OutputParser 和 LCEL 怎么配合？

如果你已经在用 LCEL（LangChain Expression Language），那 OutputParser 的接入方式其实非常自然：

```ts
const chain = prompt.pipe(model).pipe(outputParser)
```

这条链本质上做了三件事：

1. `prompt` 组织输入
2. `model` 生成原始响应
3. `outputParser` 把原始响应转成最终结果

这也是 OutputParser 最适合出现的位置：**链的末尾**。

因为它不是负责“生成内容”，而是负责“收口格式”。

## 6. 一个更完整的实战例子

下面给一个更接近真实业务的例子：从一段文章内容里抽取摘要、关键词和阅读难度。

```ts
import * as z from 'zod'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { ChatOpenAI } from '@langchain/openai'

const articleParser = StructuredOutputParser.fromZodSchema(
  z.object({
    summary: z.string().describe('100 字以内的中文摘要'),
    keywords: z.array(z.string()).describe('3 到 5 个关键词'),
    difficulty: z
      .enum(['初级', '中级', '高级'])
      .describe('阅读难度等级'),
  })
)

const prompt = ChatPromptTemplate.fromMessages([
  ['system', '你是一个技术文章分析助手，请严格按照要求输出。'],
  [
    'human',
    `请阅读下面的文章内容，并提取结构化结果：

{content}

{format_instructions}`,
  ],
])

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0,
})

const chain = prompt.pipe(model).pipe(articleParser)

const result = await chain.invoke({
  content: 'OutputParser 可以帮助开发者把模型输出转成程序能稳定消费的数据结构。',
  format_instructions: articleParser.getFormatInstructions(),
})

console.log(result)
```

这个例子里比较值得注意的有三点：

- `temperature: 0` 能减少格式漂移
- schema 描述写得越清楚，模型越容易跟上
- 解析器让最终结果更适合直接进入下游系统

## 7. 什么时候该用 OutputParser？

比较适合的场景：

- 你要把模型结果传给接口、数据库、UI 组件
- 你希望最终输出是数组、对象、枚举等结构化数据
- 你在搭链式工作流，希望每个节点输入输出都比较稳定
- 你使用的模型没有很好地支持函数调用或原生结构化输出

例如：

- 标签提取
- 信息抽取
- 表单填充
- 内容审核结果分类
- 工作流节点间的数据传递

## 8. 什么时候不一定要用 OutputParser？

如果你只是做下面这些事：

- 写一段文案
- 生成一封邮件
- 输出一段自由文本说明

那很多时候直接用 `StringOutputParser`，甚至直接读取文本结果也够了。

另外，如果你使用的模型和集成已经比较适合结构化输出，也可以优先考虑 LangChain 提供的封装方式，例如 `withStructuredOutput()`。

这类方案的优势通常是：

- 你显式编写的解析代码更少
- schema 约束通常更集中
- 某些支持结构化输出的模型上体验会更顺

但 OutputParser 仍然有它的价值：

- 更通用，不强绑某个模型能力
- 适合统一不同模型的输出收口方式
- 适合老模型、纯文本模型或兼容性优先的项目

要注意的是，`withStructuredOutput()` 也不是“绝对不会失败”。
它只是把结构约束和解析过程封装得更靠前，底层仍然依赖模型能力与运行时校验，所以一样需要兜底处理。

一句话总结：**能用模型原生结构化输出时，可以优先考虑；需要通用性和链式组合时，OutputParser 仍然很好用。**

## 9. 实践中的几个建议

### 先有 parser，再写 Prompt

很多人会先写完 Prompt，再想怎么解析。
但更稳的顺序往往是反过来：

1. 先决定最终要什么数据结构
2. 再选 parser
3. 最后围绕 parser 的格式要求写 Prompt

这样更不容易跑偏。

### 把 `format_instructions` 放进 Prompt

如果 parser 提供了 `getFormatInstructions()`，尽量把它显式注入 Prompt，而不是靠模型“猜”你想要什么格式。

### 降低随机性

在结构化输出任务里，`temperature` 通常不宜太高。

你要的是稳定，不是文采。

### 给字段写清楚语义

尤其是用 Zod schema 时，`describe()` 不是装饰品。
字段描述越清楚，模型越容易知道该填什么。

### 做好失败兜底

再好的 Prompt 和 parser，也不能保证所有模型响应都 100% 完美。
真实项目里，通常还要补这些东西：

- try-catch
- 重试策略
- 输出校验
- 降级默认值

OutputParser 是重要的一层，但不是全部。

## 10. 常见问题

### OutputParser 能保证模型一定输出正确格式吗？

不能。

它能提高可控性，也能把解析逻辑标准化，但模型本身仍然可能偏离要求。所以它更像“约束 + 解析”组合，而不是绝对保证。

### `JsonOutputParser` 和 `StructuredOutputParser` 怎么选？

可以简单这样理解：

- 只要 JSON 结果，先看 `JsonOutputParser`
- 想结合更明确 schema 约束，再看 `StructuredOutputParser`

### `StringOutputParser` 会不会太简单？

不会。

很多场景真正需要的只是“拿到稳定字符串”，而不是复杂结构。简单不代表没用，关键看你的下游需要什么。

### OutputParser 和 Prompt 谁更重要？

两者缺一不可。

- Prompt 决定模型往哪里输出
- OutputParser 决定程序怎么接住输出

如果 Prompt 写得含糊，再好的 parser 也很难救。

## 结语

学 LangChain 时，Prompt 很容易吸引注意力，因为它直接决定模型“说什么”。
但在真正落地的时候，OutputParser 决定的是另一件同样关键的事：**模型说完之后，系统能不能稳定接住。**

如果你可以把这套关系想清楚：

- Prompt 负责组织输入
- Model 负责生成输出
- OutputParser 负责收口结果

那你对 LangChain 的理解就会从“会调用模型”，往“会搭稳定工作流”迈进一步。

如果你刚开始接触这个主题，建议按这个顺序掌握：

1. 先用 `StringOutputParser` 理解“解析层”在链里的位置
2. 再用列表解析器处理简单数组场景
3. 然后学习 `JsonOutputParser`
4. 最后再补 `StructuredOutputParser` 和 schema 驱动的写法

把这几层理顺之后，你再去做提取、分类、Agent 工作流，很多问题都会更容易定位。
