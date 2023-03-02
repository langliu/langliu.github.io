---
title: 'Go WebAssembly 入门'
description: 'Go WebAssembly 入门'
publishDate: '2022-11-03'
tags:
- Golang
- WebAssembly
emoji: 😘
---

## VSCode 配置

在 VSCode 中引入 "syscall/js" 时会[提示错误](https://github.com/microsoft/vscode-go/issues/1874)，需要通过设置环境变量的方式解决：

```json
{
  "go.toolsEnvVars": {
    "GOOS": "js",
    "GOARCH": "wasm"
  }
}
```

## 示例

```go
package main

import (
    "syscall/js"
)

func main() {
    // 获取全局的 alert 对象
    alert := js.Global().Get("alert")
    // 等价于在 js 中调用 `window.alert("Hello World")`
    alert.Invoke("Hello World")
}
```

把 `main.go` build 成WebAssembly(简写为wasm)二进制文件：

```shell
GOOS=js GOARCH=wasm go build -o main.wasm main.go
```

把 JavaScript 依赖拷贝到当前路径：

```shell
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" .
```

创建一个 `index.html` 文件，并引入 `wasm_exec.js` 文件，调用刚才build的 `main.wasm`  ：

```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Go WebAssembly</title>
</head>

<body>
    <script src="wasm_exec.js"></script>
    <script>
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
            go.run(result.instance);
        });
    </script>
</body>

</html>
```

此时浏览器访问这个 html 文件则会出现一个 alert 弹窗，提示文字为 *Hello World*

![Hello World](/go-webassembly.png)

## 函数注册

在 Go 语言中调用 JavaScript 函数是一方面，另一方面，如果仅仅是使用 WebAssembly 替代性能要求高的模块，那么就需要注册函数，以便其他 JavaScript 代码调用。

```go
package main
  
import "syscall/js"

func fib(i int) int {
 if i == 0 || i == 1 {
  return 1
 }
 return fib(i-1) + fib(i-2)
}
  
func fibFunc(this js.Value, args []js.Value) interface{} {
 return js.ValueOf(fib(args[0].Int()))
}
  
func main() {
 done := make(chan int, 0)
 js.Global().Set("fibFunc", js.FuncOf(fibFunc))
 <-done
}
```

- `fib` 是一个普通的 Go 函数，通过递归计算第 i 个斐波那契数，接收一个 int 入参，返回值也是 int。
- 定义了 `fibFunc` 函数，为 `fib` 函数套了一个壳，从 `args[0]` 获取入参，计算结果用 `js.ValueOf` 包装，并返回。
- 使用 `js.Global().Set()` 方法，将注册函数 `fibFunc` 到全局，以便在浏览器中能够调用。

其中的一些类型转换：

- `js.Value` 可以将 Js 的值转换为 Go 的值，比如 `args[0].Int()`，则是转换为 Go 语言中的整型；
- `js.ValueOf`，则用来将 Go 的值，转换为 JS 的值；、
- `js.FuncOf` 将函数转换为 `Func` 类型，只有 `Func` 类型的函数，才能在 JavaScript 中调用。

`js.Func()` 接受一个函数类型作为其参数，该函数的定义必须是：

```go
func(this Value, args []Value) interface{}  
// this 即 JavaScript 中的 this  
// args 是在 JavaScript 中调用该函数的参数列表。  
// 返回值需用 js.ValueOf 映射成 JavaScript 的值
```

```html
<!DOCTYPE html>
<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Go WebAssembly</title>
</head>

<body>
    <input id="num" type="number" />
    <button id="btn" onclick="ans.innerHTML=fibFunc(num.value * 1)">Click</button>
    <p id="ans">1</p>
    <script src="wasm_exec.js"></script>
    <script>
        const go = new Go();
        WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject).then((result) => {
            go.run(result.instance);
        });
    </script>
</body>
  
</html>
```

## 操作 DOM

在上面的例子中，仅仅是注册了全局函数 `fibFunc`，事件注册，调用，对 DOM 元素的操作都是在 HTML  
中通过原生的 JavaScript 函数实现的。这些事情，能不能全部在 Go 语言中完成呢？答案可以。

```go
package main  
  
import (  
 "strconv"  
 "syscall/js"  
)  
  
func fib(i int) int {  
 if i == 0 || i == 1 {  
  return 1  
 }  
 return fib(i-1) + fib(i-2)  
}  
  
var (  
 document = js.Global().Get("document")  
 numEle   = document.Call("getElementById", "num")  
 ansEle   = document.Call("getElementById", "ans")  
 btnEle   = js.Global().Get("btn")  
)  
  
func fibFunc(this js.Value, args []js.Value) interface{} {  
 v := numEle.Get("value")  
 if num, err := strconv.Atoi(v.String()); err == nil {  
  ansEle.Set("innerHTML", js.ValueOf(fib(num)))  
 }  
 return nil  
}  
  
func main() {  
 done := make(chan int, 0)  
 btnEle.Call("addEventListener", "click", js.FuncOf(fibFunc))  
 <-done  
}
```

- 通过 `js.Global().Get("btn")` 和 `document.Call("getElementById", "num")` 两种方式获取到 DOM 元素。
- `btnEle` 调用 `addEventListener` 为 `btn` 绑定点击事件 `fibFunc`。
- 在 `fibFunc` 中使用 `numEle.Get("value")` 获取到 `numEle` 的值（字符串），转为整型并调用 `fib` 计算出结果。
- `ansEle` 调用 `Set("innerHTML", ...)` 渲染计算结果。

## 回调函数

```go
package main  
  
import (  
    "syscall/js"  
    "time"  
)  
  
func fib(i int) int {  
 if i == 0 || i == 1 {  
  return 1  
 }  
 return fib(i-1) + fib(i-2)  
}  
  
func fibFunc(this js.Value, args []js.Value) interface{} {  
 callback := args[len(args)-1]  
 go func() {  
  time.Sleep(3 * time.Second)  
  v := fib(args[0].Int())  
  callback.Invoke(v)  
 }()  
  
 js.Global().Get("ans").Set("innerHTML", "Waiting 3s...")  
 return nil  
}  
  
func main() {  
 done := make(chan int, 0)  
 js.Global().Set("fibFunc", js.FuncOf(fibFunc))  
 <-done  
}
```

## 参考

- [Go WebAssembly](https://github.com/golang/go/wiki/WebAssembly)
