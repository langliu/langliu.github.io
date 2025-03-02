---
title: React状态管理深度解析：从 Context 到 Zustand 实现
publishedAt: 2025-03-02
category: 'React'
tags:
  - 状态管理
slug: 'react-state'
isPublish: true
description: '在React应用开发中，随着应用复杂度的提升，状态管理方案经历了从原生API到第三方库的演进过程。本文将深入分析React原生Context机制，对比现代状态管理库Zustand，并最终实现一个简易版Zustand。'
---

## React Context

context 是 react 的主要特性，它能在任意层级的组件之间传递数据。

### 基本用法

```tsx
import { createContext, useContext, Component, useState } from 'react'
const MyContext = createContext<string | null>(null)

export default function App() {
  const [value, setValue] = useState('Hello, World!')
  return (
    <MyContext.Provider value={value}>
      <input type='text' value={value} onChange={(e) => setValue(e.target.value)} />
      <ComponentA />
    </MyContext.Provider>
  )
}

function ComponentA() {
  return (
    <div>
      <ComponentB />
      <ComponentC />
    </div>
  )
}

function ComponentB() {
  const value = useContext(MyContext)

  return <div>context 值为：{value}</div>
}

class ComponentC extends Component {
  render() {
    return <MyContext.Consumer>{(value) => <div>context 值为：{value}</div>}</MyContext.Consumer>
  }
}
```

> 用 createContext 创建 context 对象，用 Provider 修改其中的值， function 组件使用 useContext 的 hook 来取值，class 组件使用 Consumer 来取值。

在业务代码中用 context 可能不多，大家更偏向于全局的状态管理库，比如 redux、zustand，但在 antd 等组件库里用的特别多。

### createContext实现原理剖析

核心实现机制
React Context通过Provider-Consumer模式实现跨组件通信，其核心代码精简后如下：

```javascript
function createContext(defaultValue) {
  const context = {
    _currentValue: defaultValue,
    Provider: function (props) {
      context._currentValue = props.value
      return props.children
    },
    Consumer: function (props) {
      return props.children(context._currentValue)
    },
  }
  return context
}
```

createContext 函数返回一个 context 对象，其中包含三个属性：

- \_currentValue：当前 context 的值，初始值为传入 createContext 的 defaultValue。
- Provider：一个组件，用于修改 context 的值。
- Consumer：一个组件，用于消费 context 的值。

当 Provider 组件被渲染时，它会修改 context 的值为 Provider 组件的 value 属性。当 Consumer 组件被渲染时，它会调用 Consumer 组件的 children 函数，并将 context 的值作为参数传入。
这样，当 Provider 组件的 value 属性发生变化时，所有依赖该 context 的 Consumer 组件都会重新渲染。

这种 Provider 类型的 vdom 自然会转为对应的 fiber 节点，在 reconcile 的时候会做单独的处理：

![](/images/react-provider.awebp)

可以看到 Provider 的处理就是修改了 `context._currentValue` 的值：

![](/images/react-provider2.awebp)

### Context 的缺点和解决方案

#### 需要用Provider包裹

```tsx
import { createContext, useContext } from 'react'

const countContext = createContext(111)

function Aaa() {
  const count = useContext(countContext)

  return (
    <div>
      <h1>context 的 值为：{count}</h1>
      <Bbb></Bbb>
    </div>
  )
}

function Bbb() {
  return (
    <div>
      <countContext.Provider value={222}>
        <Ccc></Ccc>
      </countContext.Provider>
    </div>
  )
}

function Ccc() {
  const count = useContext(countContext)
  return <h2>context 的 值为：{count}</h2>
}

export default Aaa
```

如上，Aaa 和 Ccc 都用了 countContext，当中间组件 Bbb 改变了 countContext 的值时，那如果 context 是全局的话 Aaa、Ccc 组件的值都应该修改才对。

但实际上不是，Aaa 组件中的值是 111，Ccc 组件中的值是 222。

这是因为 react 对 context 还有一个处理：

在修改 `context._currentValue` 之前还有一个 push。
这个就是把当前的 context 值入栈：

![](/images/react-provider3.webp)

之后处理完这个 fiber 节点会再 pop 出栈，回到父节点的时候，context 恢复回之前的：

![](/images/react-provider4.webp)

这就是为什么 context 只能影响子组件，影响不了父组件。

**解决方案：**

- 在所有使用 context 的组件的最顶层用 Provider 包裹，这样就可以保证 context 的值是全局的。

#### 性能问题

```tsx
import { FC, PropsWithChildren, createContext, useContext, useState } from 'react'

interface ContextType {
  aaa: number
  bbb: number
  setAaa: (aaa: number) => void
  setBbb: (bbb: number) => void
}

const context = createContext<ContextType>({
  aaa: 0,
  bbb: 0,
  setAaa: () => {},
  setBbb: () => {},
})

const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [aaa, setAaa] = useState(0)
  const [bbb, setBbb] = useState(0)

  return (
    <context.Provider
      value={{
        aaa,
        bbb,
        setAaa,
        setBbb,
      }}
    >
      {children}
    </context.Provider>
  )
}

const App = () => (
  <Provider>
    <Aaa />
    <Bbb />
  </Provider>
)

const Aaa = () => {
  const { aaa, setAaa } = useContext(context)

  console.log('Aaa render...')

  return (
    <div>
      aaa: {aaa}
      <button onClick={() => setAaa(aaa + 1)}>加一</button>
    </div>
  )
}

const Bbb = () => {
  const { bbb, setBbb } = useContext(context)

  console.log('Bbb render...')

  return (
    <div>
      bbb: {bbb}
      <button onClick={() => setBbb(bbb + 1)}>加一</button>
    </div>
  )
}

export default App
```

如上，Aaa 和 Bbb 都用了 context，修改 aaa 的时候，会同时触发 bbb 组件的渲染，修改 bbb 的时候，也会触发 aaa 组件的渲染。因为不管修改 aaa 还是 bbb，都是修改 context 的值，会导致所有用到这个 context 的组件重新渲染。

**解决方案：**

- 按照使用的地方不同，将原本的 context 拆分成两个 context 不就不会互相影响了（多层Provider嵌套导致组件结构复杂化）
- 使用 `memo` 对 Aaa 和 Bbb 进行包裹，这样就只会在 aaa 和 bbb 变化的时候重新渲染。

## zustand

zustand 是一个轻量级的状态管理库，它的核心思想是使用函数式编程的方式来管理状态。

### 基本用法

```tsx
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```
