---
title: JavaScript作用域
date: 2017-05-21 23:53:40
categories: 
    - 前端
tag: 
    - JavaScript
---

## 作用域是什么

几乎所有的编程语言最基础的功能之一，就是能够储存变量当中的值，并且能够在之后对这个值进行访问和修改。但是这些变量存储在哪里？程序需要的时候怎么找到这些变量呢？这时就需要一套设计良好的规则来存储变量，并且可以方便地找到这些变量，这套规则被称为作用域。

<!-- more -->

所以说，作用域是一套规则，用于确定在何处以及如何查找变量。

## 词法作用域

词法作用域就是定义在词法阶段的作用域。简单说，就是由你写代码时写在哪里来决定的。

```JavaScript
function foo(a) {
    var b = a * 2;

    function bar(c) {
        console.log(a, b, c);
    }
}
foo(2); // 2, 4, 12
```

上面的代码有三个逐级嵌套的作用域，在 js 中词法作用域规则:

1. 函数允许访问函数外的数据.
2. 整个代码结构中只有函数可以限定作用域.
3. 作用规则首先使用提升规则分析.
4. 作用域查找会在找到第一个匹配的标识符时停止.

### 欺骗词法

由于词法作用域在写代码的时候就已经确定了，那么我们怎么才能在运行的时候来修改词法作用域呢？

在JavaScript中有两种机制来实现这个目的（`eval`和`with`）。但这两种机制并不是什么好主意，因为他们会导致性能的下降，所以不推荐使用欺骗词法，只要知道有这么个东西就好了。

#### eval

JavaScript中的`eval(..)`可以接受一个字符串作为参数，并将其中的内容视为好像在书写就存在于程序中这个位置的代码。

```JavaScript
function foo(str, a) {
    eval(str); //欺骗
    console.log(a, b);
}

var b = 2;

foo("var b = 1;", 1); // 1, 1
```

从上面代码可以看出，当`eval(..)`调用传进去的字符串时，程序把该字符串当做本来就在那里一样来处理。因为在字符串中定义了变量b，所以外部的变量b被屏蔽了。

#### with

JavaScript中另一个欺骗词法作用域的机制就是`with`关键字。

```JavaScript
function foo(obj) {
    with(obj) {
        a = 2;
    }
}

var obj = {
    b: 3
};

foo(obj);
console.log(obj.a); // undefined
console.log(a); // 2
```

在上面的代码中，当执行`foo(obj)`时，`obj`并没有`a`属性，因此`obj.a`为`undefined`。但是在`foo(..)`函数中`a = 2;`却创建了一个全局变量`a`。

**在严格模式的程序中，`eval(..)`在运行时有着自己的词法作用域，意味着其中的声明无法修改所在的作用域，而`with`则被完全禁止了。**


## 函数作用域

函数作用域的含义是指，属于这个函数的全部变量都可以在整个函数的范围内使用及复用。

### 函数的用途

- 隐藏内部实现
- 代码复用
- 组合调用

### 立即执行函数表达式（IIFE）

```JavaScript
var a = 2;
(function foo() {
    var a = 3;
    console.log(a); // 3
})();
console.log(a); // 2
```

由于函数被包含在一对( )括号内部，因此成为了一个表达式，通过在末尾加上另外一个( )可以立即执行这个函数。

#### 两种形式

- `(function(){ .. })()`
- `(function(){ .. }())`

## 块作用域

我在《JavaScript语言精粹》中看到过这样一句话“糟糕的是，尽管Javascript的代码块语法貌似支持块级作用域，实际上JavaScript并不支持。这个混淆之处可能成为错误之源。”

```JavaScript
for (var i = 0; i < 10; i++) {
    console.log(i);
}
console.log(i); // 10
```

在上面的代码中，我们可以看到在`for`循环内部定义的变量污染到了全局作用域中。

那么JavaScript中真的没有块作用域吗？很少有人注意到JavaScript的ES3规范中规定`try/catch`的`catch`分句会创建一个块作用域，其中声明的变量仅在catch内部有效。

```JavaScript
try {
    undefined();
} catch (error) {
    console.log(error); // 能够正常运行
}
console.log(error); //
```

在ES6中，引入了新的`let`关键字，提供了除了`var`以外的另一种变量声明方式。`let`关键字可以将变量绑定到所在的任意作用域中（通常是`{ ... }`内部）

```JavaScript
for (let i = 0; i < 10; i++) {
    console.log(i);
}
console.log(i); // ReferenceError: i is not defined
```

对比上面的代码，我们可以发现使用`let`关键字时，块作用域外部并不能访问内部的变量。

除了`let`以外，ES6还引入了`const`，同样可以用来创建块作用域变量，但其值是固定的（常量），之后任何试图修改值的操作都会引起错误。
