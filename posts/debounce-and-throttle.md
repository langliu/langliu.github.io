---
title: '防抖和节流'
publishedAt: 2024-03-09
description: '防抖和节流介绍和应用'
slug: 'debounce-and-throttle'
isPublish: true
category: 'JavaScript'
---

防抖（Debounce）和节流（Throttle）是两种在前端开发中常用的性能优化技术，它们主要用于控制事件处理函数的执行频率，以提高页面的响应速度和性能。

## 防抖（Debounce）

防抖的核心思想是延迟函数的执行。当事件被触发时，防抖函数会立即执行一个计时器，如果在计时器结束之前事件又被触发，则计时器会被重置。这样，事件处理函数只会在最后一次事件触发后的计时器结束后执行一次。

防抖函数通常用于输入框搜索、窗口大小调整等场景，以避免用户在输入或调整过程中产生大量不必要的计算。

## 节流（Throttle）

节流的核心思想是保证函数在一定时间间隔内只执行一次。与防抖不同，节流函数在事件触发时会立即执行，但如果在指定的时间间隔内再次触发事件，节流函数会阻止这次执行，直到时间间隔过后才允许下一次执行。

节流函数适用于需要频繁触发但又不能频繁执行的场景，如滚动事件处理、窗口大小调整等。

## 实现方式

两者都可以通过闭包和定时器（setTimeout 和 clearTimeout）来实现。

### 防抖的实现

```js
function debounce(func, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
```

#### React hooks 实现

```tsx
import { useEffect, useRef, useCallback } from 'react'

/**
 * 防抖函数
 * @param fn 函数
 * @param delay
 */
export function useDebounceFn(fn: (...args: unknown[]) => unknown, delay: number = 1000) {
  const ref = useRef<{
    timer: NodeJS.Timeout | null
    fn: Function
  }>({
    timer: null,
    fn,
  })

  useEffect(() => {
    ref.current.fn = fn
  }, [fn])

  return useCallback(
    (...args) => {
      if (ref.current.timer) {
        clearTimeout(ref.current.timer)
      } else {
        ref.current.timer = setTimeout(() => {
          ref.current.fn(...args)
        }, delay)
      }
    },
    [delay],
  )
}
```

### 节流的实现

```js
function throttle(func, limit) {
  let inThrottle
  let lastFunc
  let lastRan
  return function () {
    const context = this
    const args = arguments
    if (!inThrottle) {
      func.apply(context, args)
      lastRan = Date.now()
      inThrottle = true
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(
        function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan),
      )
    }
  }
}
```

## 在实际项目中，如何决定使用防抖还是节流技术？

在实际项目中，决定使用防抖（Debounce）还是节流（Throttle）技术主要取决于你的具体需求和事件触发的上下文。以下是一些决策的指导原则：

### 使用防抖（Debounce）的情况

1. **用户行为的最终结果**：如果你需要在用户完成一系列操作后（例如，停止输入）才执行某个函数，那么防抖是合适的。例如，搜索框输入时的搜索请求，你希望用户输入完成后才去请求搜索结果。

2. **高频事件**：当事件触发的频率非常高，但你只关心最后一次操作的结果时，防抖可以减少不必要的计算和请求。例如，窗口大小调整事件（resize）。

3. **事件完成后的操作**：如果你的操作应该在事件停止发生后执行，比如输入框的验证，那么防抖是更好的选择。

### 使用节流（Throttle）的情况

1. **平滑的用户体验**：如果你需要在用户操作过程中提供平滑的体验，比如滚动时的无限滚动加载，节流可以保证在用户滚动过程中，事件处理函数以固定的时间间隔执行。

2. **实时响应**：如果你需要在用户操作过程中实时响应，但又不希望响应过于频繁，节流可以保证在用户操作的整个过程中，事件处理函数至少每隔一定时间执行一次。

3. **连续的操作**：对于连续发生的事件，如鼠标移动（mousemove）或滚动（scroll），如果你希望在用户操作期间保持一定的响应频率，节流是合适的。

### 实际决策时的考虑因素

- **事件的触发频率**：如果事件触发非常频繁，可能需要节流来保证性能。
- **事件处理的复杂度**：如果事件处理函数执行耗时较长，可能需要防抖来减少执行次数。
- **用户期望的响应时间**：用户是否期望立即看到响应，还是可以接受稍后处理的结果。
- **资源消耗**：频繁的事件处理可能会消耗大量CPU资源，需要考虑是否有必要进行节流或防抖。

在某些情况下，你可能需要结合两者，或者使用更复杂的逻辑来处理事件。例如，你可以在滚动事件中使用节流来保持流畅的滚动体验，同时在用户停止滚动后使用防抖来执行一些清理工作。最终的选择应该基于对用户体验和性能需求的权衡。
