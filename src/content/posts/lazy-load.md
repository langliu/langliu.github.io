---
title: "从零开始实现lazy-load"
publishedAt: 2024-12-29
description: "懒加载是一种优化网页性能的技术，它可以延迟加载非关键资源（如图片），直到用户滚动到相应位置时才进行加载，从而提高页面的初始加载速度和性能。我们将通过 JavaScript 代码来实现这一功能，并对其原理和实现步骤进行深入探讨。"
slug: "lazy-load"
isPublish: true
---

## 引言

在现代网页开发中，页面性能是至关重要的。当页面包含大量图片或其他媒体资源时，如果一次性全部加载，可能会导致页面加载缓慢，影响用户体验。懒加载技术通过只在用户需要时才加载资源，有效地解决了这个问题。

## 懒加载原理

懒加载的基本原理是利用浏览器的 [`IntersectionObserver`](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver) API检测元素是否处于可见区域内。
当页面加载时，组件最初展示一个占位元素，组件的子元素暂不展示。当用户滚动页面时，通过 JavaScript 检测LazyLoad是否进入了可视区域，如果进入可视区域，则将控制展示子元素，从而触发加载。

## 组件入参设计

```typescript
export type LazyLoadProps = {
  /**
   * 懒加载的元素
   */
  children?: ReactNode;
  /**
   * 懒加载的距离
   */
  offset?: number | string;
  /**
   * 懒加载的回调
   */
  onLoad?: () => void;
  /**
   * 占位元素
   */
  placeholder?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};
```

## 组件实现

```tsx
export function LazyLoad({
  children,
  offset = 0,
  onLoad,
  placeholder,
  className,
  style,
}: LazyLoadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log(entries);
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShow(true);
            onLoad?.();
            observer.unobserve(entry.target);
          }
        }
      },
      {
        rootMargin:
          typeof offset === 'number' ? `${offset}px` : offset || '0px',
        threshold: 0,
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [onLoad, offset]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {show ? children : placeholder}
    </div>
  );
}
```