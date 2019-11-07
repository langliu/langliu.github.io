---
title: JavaScript的this指向问题
date: 2017-10-18 23:28:16
categories:
    - 前端
tags:
    - JavaScript
---

和许多常见的其他语言不一样，JavaScript的 this 指向不是在定义时就确定了的，而是在调用时确定的。

## 指向

### 全局指向

在严格模式下，默认的 this 指向 undefined ，在非严格模式下，默认的 this 指向 window

<!-- more -->

```javascript
let x = 1;
function test() {
  console.log(this.x);
}
test(); // 严格模式下为： undefined ；非严格模式为： 1
```
### 对象内部的指向

如果 this 是在对象内部定义的，一般来说 this 指向 this 定义时的上一级对象

```javascript
let obj = {
  name: "Allen",
  getName: function() {
    console.log(this.name);
  }
};
obj.getName(); // 'Allen'
```

```javascript
let obj = {
  name: "Allen",
  getName: {
    name: "Youngor",
    fn: function() {
      console.log(this.name);
    }
  }
};
obj.getName.fn(); // 'Youngor'
```

在上面的例子中，第一个例子的 `this` 指向对象 `obj` ，第二个例子的 `this` 指向对象 `obj` 的属性 `getName`（因为该属性也是一个对象），如果 `getName` 属性中不存在对象属性 `name` ，那么 `this.name` 则为 `undefined` ，`this` 并不会在向上一级寻找。

有一种情况有点特殊，需要我们注意下：

```javascript
let obj = {
  name: "Allen",
  getName: {
    name: "Youngor",
    fn: function() {
      console.log(this.name);
    }
  }
};
let fn = obj.getName.fn;
fn(); // undefined
```

我们发现结果和我们预期的有点不一样，这是为什么呢？我们需要记住这句话 **this永远指向的是最后调用它的对象** ，在上面的例子中，我们把 `obj.getName.fn` 赋值给一个变量 `fn` ，通过这个变量来执行this，这时候最后调用它的对象已经从对象 `obj` 的属性 `getName` 变为全局对象了，所以执行的结果是 `undefined`。

### 构造函数中的this

```javascript
function Person() {
  this.name = "Allen";
  this.age = 21;
}

let person = new Person();
console.log(person.name); // 'Allen'
console.log(person.age); // 21
```

`new` 关键字可以改变 this 的指向，将其指向新建的对象，在这里指向 `person` 对象

### 当 this 遇见 return

```javascript
function fun() {
  this.name = "Allen";
  return 1;
}

let f = new fun();
console.log(f.name); // 'Allen'
```

```javascript
function fun() {
  this.name = "Allen";
  return {};
}

let f = new fun();
console.log(f.name); // undefined
```

如果返回值是一个对象，那么this指向的就是那个返回的对象（null除外）；如果返回值不是一个对象，那么this指向的还是那个函数的实例。

### 箭头函数中的 this

函数体内的this对象，就是定义时所在的对象，而不是使用时所在的对象。 

## bind、apply、call对this的影响

### bind
`bind()`  的作用是将当前函数与指定的对象绑定，并返回一个新的函数，这个新函数无论以什么样的方式调用，其 this 始终指向绑定的对象。

```javascript
function test() {
    console.log(this.name);
}

let obj1 = {
    name: 'hi'
};
let fun = test.bind(obj1); // 第一次bind
fun(); // 'hi'
fun.bind({name: 'srd'}); // 第二次bind
fun(); // 'hi'
```

### call

`call()` 方法调用一个函数, 其具有一个指定的this值和分别地提供的参数(参数的列表)。

```javascript
function fun() {
  console.log(this.name);
}
fun.call({ name: "Allen" }); // 'Allen'
```

### apply

`apply()` 方法调用一个函数, 其具有一个指定的this值，以及作为一个数组（或类似数组的对象）提供的参数。

```javascript
function fun() {
  console.log(this.name);
}
fun.apply({ name: "Allen" }); // 'Allen'
```