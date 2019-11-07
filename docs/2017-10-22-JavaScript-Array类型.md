---
title: JavaScript-Array类型
date: 2017-10-22 14:54:25
categories:
    - 前端
tags:
    - JavaScript
---

在JavaScript中除了Object类型外Array类型是使用最多的类型了，但是一直对其中的方法没有记得很熟练，于是写下这篇文章来记一下。

<!--more-->

## 数组的创建

数组的创建有两种方式：字面量和构造函数

### 构造函数方式

构造函数接受零个或多个参数：

- 当参数为零时，创建一个空数组；
- 当只有一个参数时，如果该参数为数字，则创建一个包含给定项数的数组，否则创建一个包含那个值的数组；
- 当参数为多个时，创建包含给定参数的数组。

```javascript
let colors = new Array('red','green');
```

### 字面量方式

字面量由一对包含数组项的方括号表示，多个数组项之间以逗号隔开。

```javascript
let colors = ['red','green'];
```

## 属性

### length属性

数组的length属性可以获取数组的项数，并且可以通过给该属性赋值来改变数组的项数。

## 方法

### Array.from()

`Array.from` 方法用于将两类对象转为真正的数组：类似数组的对象（array-like object）和可遍历（iterable）的对象（包括ES6新增的数据结构Set和Map）

#### 语法

```javascript
Array.from(arrayLike, mapFn, thisArg)
```

##### 参数

- arrayLike：想要转换成数组的伪数组对象或可迭代对象。
- mapFn (可选参数)：如果指定了该参数，新数组中的每个元素会执行该回调函数。
- thisArg (可选参数)：可选参数，执行回调函数 mapFn 时 this 对象。

##### 返回值

一个新的数组实例

```javascript
let a = Array.from('123', value => Number.parseInt(value) + 3); // [4, 5, 6]
```

### Array.isArray()

`Array.isArray()` 用于确定传递的值是否是一个 Array。

#### 语法

```javascript
Array.isArray(obj)
```

##### 参数

- obj：需要检测的值。

##### 返回值

返回一个布尔值：如果对象是 `Array`，则为`true`; 否则为`false`。

```javascript
Array.isArray([1]); // true
Array.isArray({}); // false
```

### Array.of() 

`Array.of()` 方法创建一个具有可变数量参数的新数组实例，而不考虑参数的数量或类型。


```javascript
Array.of(3, 11, 8) // [3,11,8]
Array.of(3) // [3]
Array.of(3).length // 1
```

这个方法的主要目的，是弥补数组构造函数Array()的不足。因为参数个数的不同，会导致Array()的行为有差异。

#### 语法

```javascript
Array.of(element0[, element1[, ...[, elementN]]])
```

##### 参数

- elementN：任意个参数，将按顺序成为返回数组中的元素。

##### 返回值

新的 `Array` 实例
