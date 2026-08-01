---
title: 'Intl 解决前端日期和时间的格式化'
publishedAt: 2023-03-07
description: 'Intl 解决前端日期和时间的格式化'
slug: 'intl-date-format'
tags:
  - JavaScript
  - Intl
  - 日期时间
isPublish: true
category: 'JavaScript'
---

## 简介

`Intl` 是一个全局对象，它的主要用途就是展示国际化信息，可以将字符串，数字和日期和时间转换为指定地区的格式。

在前端开发中，我们通常会使用第三方库来处理日期和数字的格式化，比如 [numeral](https://www.npmjs.com/package/numeral)、[dayjs](https://www.npmjs.com/package/dayjs)、[date-fns](https://www.npmjs.com/package/date-fns) 等库，这些库包含了许多的功能，如果我们在项目中仅仅只使用了格式化的功能的话其实是可以不用引入这些库的，JavaScript 自带的 `Intl` API 即可满足格式化的需求。

## 构造

`Collator`，`DateTimeFormat`，`ListFormat`，`NumberFormat`，`PluralRules`，`RelativeTimeFormat` 是命名空间 `Intl` 中的构造函数。它们接受两个参数 - `locales` 和 `options`。 locales 必须是符合 [BCP 47 语言标记](https://www.rfc-editor.org/rfc/rfc5646) 的字符串或字符串数组。

### `locales` 参数

其中 locales 中常用的有：

| 值               | 含义                             |
| ---------------- | -------------------------------- |
| `zh-Hant`        | 用繁体字书写的中文               |
| `zh-Hans`        | 用简体字书写的中文               |
| `zh-cmn-Hans-CN` | 中文，普通话，简体，用于中国     |
| `zh-Hans-CN`     | 简体中文，用于中国大陆           |
| `zh-yue-HK`      | 中文，广东话，香港特别行政区使用 |
| `cmn-Hans-CN`    | 简体中文，用于中国               |
| `yue-HK`         | 粤语，香港特别行政区使用         |
| `en-US`          | 美式英语 (US English)            |
| `en-GB`          | 英式英语 (British English)       |
| `ko-KR`          | 韩语                             |
| `ja-JP`          | 日语                             |

### `options` 参数

`options` 参数必须是一个对象，其属性值在不同的构造函数和方法中会有所变化。如果 `options` 参数未提供或者为 undefined，所有的属性值则使用默认的。

### Intl.NumberFormat

`Intl.NumberFormat` 对象能使数字在特定的语言环境下格式化。

```javascript
const number = 123456.789

console.log(new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number))
// Expected output: "123.456,79 €"

// The Japanese yen doesn't use a minor unit
console.log(new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number))
// Expected output: "￥123,457"

console.log(new Intl.NumberFormat('zh-CN', {}).format(number))
// "123,456.789"
```

#### 常用 options 参数

- `style`：要使用的格式样式，默认为 `decimal`。
  - `decimal` 用于普通数字格式。
  - `currency` 用于货币格式。
  - `percent` 用于百分比格式。
  - `unit` 用于单位格式。
- `currency`：用于货币格式的货币（没有默认值，如果 `style` 的值是 `currency` 则必须提供）。可能的值是 ISO 4217 货币代码，例如 `CNY` 代表人民币， `USD` 代表美元，`EUR` 代表欧元，`JPY` 代表日元。
- `currencyDisplay`：如何以货币格式显示货币。可能的值是：
  - `symbol` 使用本地化的货币符号，例如 €。这是默认值。
  - `narrowSymbol` 使用简称（`$100` 而不是 `US$100`）。
  - `code` 使用 ISO 货币代码。
  - `name` 使用本地化的货币名称，例如 `dollar`。
- `currencySign`：在许多区域设置中，记帐格式将数字括在括号中而不是添加减号。`currencySign` 通过将选项设置为 `accounting` 启用此格式。默认为 `standard`。
- `unit`：`unit` 的格式中使用的单位，可能的值是核心单位标识符，如[UTS #35，第 2 部分，第 6 节](https://unicode.org/reports/tr35/tr35-general.html#63-example-units)中所定义。从整个列表中选择了一部分单元用于 ECMAScript。一对简单单位 `-per-` 可以用组合成一个复合单位。没有默认值。如果是 `style` 为 `unit`，则必须指定该属性。
- `unitDisplay`：`unit` 用于格式化的单位格式化样式，默认为 `short`。
  - `long`（例如 16 litres）
  - `short`（例如 16 l）
  - `narrow`（例如 16l）
- `notation`：一种显示数值的格式。默认为 `standard`。
  - `standard` 是正常的数字格式。
  - `scientific`：使用科学记数法表示，比如 `4.5E5`。
  - `engineering`： 返回 10 的幂能够被 3 整除的科学计数表示（如果一个数小于 1000，则表示为 123 - `123E0`，如果一个数大于 1000 小于 1000000，则表示为 45100 - `45.1E3`）。
  - `compact` 是表示指数表示法的字符串，默认使用“短”格式。
- `compactDisplay`：仅在 `notation` 为 `compact` 时使用。可以是 `short`（默认）或 `long`。
- `maximumFractionDigits`：最大分数位数（最多保留几位小数）
- `minimumFractionDigits`：最小分数位数（最少保留几位小数）
- `maximumSignificantDigits`：最多几位有效数字

#### 例子

##### 货币 🪙

```javascript
const numbers = [245, 2345234.2345, 3456]

const formatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

numbers.forEach((number) => {
  console.log(formatter.format(number))
})
// ¥245.00
// ¥2,345,234.23
// ¥3,456.00

new Intl.NumberFormat('cmn-Hans-CN', {
  style: 'currency',
  currency: 'CNY',
  currencyDisplay: 'name',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(245) // 245.00人民币

new Intl.NumberFormat('cmn-Hans-CN', {
  style: 'currency',
  currency: 'CNY',
  currencyDisplay: 'name',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(2345234.2345) // 2,345,234.23 人民幣
```

##### 百分比

```javascript
new Intl.NumberFormat('cmn-Hans-CN', { style: 'percent' }).format(34) // 3,400%

new Intl.NumberFormat('cmn-Hans-CN', { style: 'percent' }).format(0.34) // 34%
```

##### 单位格式

```javascript
new Intl.NumberFormat('cmn-Hans-CN', { style: 'unit', unit: 'kilometer-per-hour' }).format(4522) // 4,522 km/h

new Intl.NumberFormat('cmn-Hans-CN', {
  style: 'unit',
  unit: 'kilometer-per-hour',
  unitDisplay: 'long',
}).format(4522) // 每小时4,522公里

new Intl.NumberFormat('cmn-Hans-CN', {
  style: 'unit',
  unit: 'kilometer-per-hour',
  unitDisplay: 'narrow',
}).format(4522) // 4,522km/h
```

##### 科学缩写

```javascript
console.log(new Intl.NumberFormat('cmn-Hans-CN', { notation: 'scientific' }).format(452136)) // 4.521E5
console.log(new Intl.NumberFormat('cmn-Hans-CN', { notation: 'engineering' }).format(452136)) // 452.136E3
console.log(new Intl.NumberFormat('cmn-Hans-CN', { notation: 'compact' }).format(452136)) // 45万
```

### Intl.DateTimeFormat

`Intl.DateTimeFormat` 对象能使日期和时间在特定的语言环境下格式化。

#### 常用 options 参数

- `dateStyle`：调用 `format()` 时使用的日期格式样式。可能的值包括：
  - `full`
  - `long`
  - `medium`
  - `short`（默认值）
- `timeStyle`：调用 `format()` 时使用的时间格式样式。可能的值包括：
  - `full`
  - `long`
  - `medium`
  - `short`（默认值）
- `dayPeriod`: 用于“早上”、“上午”、“中午”、“n”等日期时间段的格式样式。可能的值包括： `narrow`, `short`, `long`
- `timeZone`: 时区，比如上海“Asia/Shanghai”，纽约是"America/New_York"
- `hourCycle`: 要使用的小时周期（12小时制，24小时制） 值可以为：`h11`、`h12`、`h23`、`h24`
- `weekday`: 工作日的表示形式。可能的值为：
  - `long`（例如，Thursday)
  - `short`（例如，Thu)
  - `narrow`（例如，）。两个工作日可能 对于某些语言环境具有相同的窄样式（例如 的窄样式也是）。TTuesdayT
- `year`: 年份的表示。可能的值为：
  - `numeric`（例如，2012)
  - `2-digit`（例如，12)
- `month`: 月份的表示。可能的值为：
  - `numeric`（例如，2)
  - `2-digit`（例如，02)
  - `long`（例如，March)
  - `short`（例如，Mar)
  - `narrow`
- `day`: 一天的表示。可能的值为：
  - `numeric`（例如，1)
  - `2-digit`（例如，01)
- `hour`: 小时的表示。可能的值为：
  - `numeric`（例如，1)
  - `2-digit`（例如，01)
- `minute`: 分钟的表示。可能的值为：
  - `numeric`（例如，1)
  - `2-digit`（例如，01)
- `second`: 秒的表示。可能的值为：
  - `numeric`（例如，1)
  - `2-digit`（例如，01)
- `fractionalSecondDigits`: 用于表示秒小数部分的位数（其他的数字将被截断）。可能的值为：
  - `0`: 小数部分全部丢弃。
  - `1`: 小数部分表示为 1 位数字。为 例如.736 的格式为 .7
  - `2`:小数部分表示为 2 位数字。为 例如 .736 的格式为 .73
  - `3`:小数部分表示为 3 位数字。为 例如 .736 的格式为 .736

#### 例子

```javascript
const date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0))
console.log(new Intl.DateTimeFormat('zh-CN').format(date)) // "2012/12/20"
console.log(
  new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'full',
    timeStyle: 'long',
    timeZone: 'Asia/Shanghai',
  }).format(date),
) // “2012年12月20日星期四 GMT+8 11:00:00”
console.log(
  new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Shanghai',
  }).format(date),
) // “2012年12月20日星期四 11:00”
console.log(
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date),
) // “2012/12/20”
```
