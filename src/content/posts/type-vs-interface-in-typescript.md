---
title: 'TypeScript 中的 type 和 interface'
description: '在 TypeScript 中定义类型有两种选择：类型和接口。关于 TypeScript 最常见的问题之一是我们应该使用接口还是类型。'
slug: type-vs-interface-in-typescript
publishedAt: 2024-03-29
isPublish: true
---

在 TypeScript 中定义类型有两种选择：类型和接口。关于 TypeScript 最常见的问题之一是我们应该使用接口还是类型。

与许多编程问题一样，这个问题的答案是视情况而定。在某些情况下，一种比另一种具有明显的优势，但在许多情况下，它们是可以互换的。

## 类型和类型别名

`type` 是 TypeScript 中的一个关键字，我们可以用它来定义数据的类型。 TypeScript 中的基本类型包括：

- `String`
- `Boolean`
- `Number`
- `Array`
- `Tuple`
- `Enum`

TypeScript 中的类型别名意味着“任何类型的名称”。它们提供了一种为现有类型创建新名称的方法。类型别名不定义新类型；相反，它们为现有类型提供替代名称。

```ts
type MyNumber = number
type ErrorCode = string | number
type Answer = string | number
type User = {
  id: number
  name: string
  email: string
}
```

虽然底层类型相同，但不同的名称表达不同的意图，这使得代码更具可读性。

## TypeScript 中的接口

在 TypeScript 中，接口定义了对象必须遵守的契约。

```ts
interface Client {
  name: string
  address: string
}
```

## types 和 interfaces 的差异

### 原始类型

原始类型是 TypeScript 中的内置类型。它们包括 `number` 、 `string` 、 `boolean` 、 `null` 和 `undefined` 类型。

我们可以为原始类型定义类型别名，但是，我们不能使用 `interface` 来给原始类型起别名。

```ts
type NullOrUndefined = null | undefined
```

### 联合类型

联合类型允许我们描述可以是多种类型之一的值，并创建各种原始、文字或复杂类型的联合：

```ts
type Transport = 'Bus' | 'Car' | 'Bike' | 'Walk'
```

联合类型只能使用 `type` 来定义。接口中没有与联合类型等效的东西。但是，可以从两个接口创建新的联合类型，如下所示：

```ts
interface CarBattery {
  power: number
}
interface Engine {
  type: string
}
type HybridCar = Engine | CarBattery
```

### 函数类型

在 TypeScript 中，函数类型代表函数的类型签名。使用类型别名，我们需要指定参数和返回类型来定义函数类型：

```ts
type AddFn = (num1: number, num2: number) => number
```

### 声明合并

声明合并是 `interface` 独有的功能。通过声明合并，我们可以多次定义一个接口，TypeScript 编译器会自动将这些定义合并为一个接口定义。

```ts
interface Client {
  name: string
}

interface Client {
  age: number
}

const harry: Client = {
  name: 'Harry',
  age: 41,
}
```

类型别名不能以相同的方式合并。如果您尝试多次定义 Client 类型，如上面的示例所示，将会抛出错误。

### 延伸与交叉

一个 `interface` 可以扩展一个或多个 `interface` 。使用 `extends` 关键字，新接口可以继承现有接口的所有属性和方法，同时还可以添加新属性。

```ts
interface VIPClient extends Client {
  benefits: string[]
}
```

为了对类型实现类似的结果，我们需要使用交集运算符：

```ts
type VIPClient = Client & { benefits: string[] }
```

### 扩展时处理冲突

类型和接口之间的另一个区别是，当您尝试从具有相同属性名称的类型进行扩展时，如何处理冲突。

扩展接口时，不允许使用相同的属性键，如下例所示：

```ts
interface Person {
  getPermission: () => string
}

interface Staff extends Person {
  getPermission: () => string[]
}
```

由于检测到冲突而引发错误。

![conflict detected error thrown](/images/conflict-detected-error-thrown.avif)

`type` 以不同的方式处理冲突。如果 `type` 使用相同的属性键扩展另一个类型，它将自动合并所有属性而不是抛出错误。

```ts
type Person = {
  getPermission: (id: string) => string
}

type Staff = Person & {
  getPermission: (id: string[]) => string[]
}

const AdminStaff: Staff = {
  getPermission: (id: string | string[]) => {
    return (typeof id === 'string' ? 'admin' : ['admin']) as string[] & string
  },
}
```

### 元组类型

在 TypeScript 中，元组类型允许我们表达具有固定数量元素的数组，其中每个元素都有其数据类型。当您需要处理具有固定结构的数据数组时，它会很有用：

```ts
type TeamMember = [name: string, role: string, age: number]
```
