---
title: webpack基础配置和配置文件分离
date: 2021-08-01
categories:
  - 源码
tags:
  - webpack
---

# 关于模块 cjs, umd. esm

- commonjs
  可以在 node 环境下运行
  module.exports 和 require

- umd
  可以在 node 和浏览器同时运行 可以在 node/webpack 环境 require, 也可以在 CDN 中引用

- esm: 一种前端模块化规范

:::tip
cjs 引用时是值的拷贝，esm 为值的引用
:::

# AST(抽象语法树)

关于代码转化: Code-AST-Transform-Code

- extensions:
  查看 ast 转换的网站 [https://astexplorer.net/](https://astexplorer.net/)
  简易 ast 编译 [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)

# webpack 运行时

webpack 打包后代码是怎么运行的:

1. 核心modules数组: __webpack__modules根据顺序保存了 模块的导入函数

简单的主模块数组

```js
var __webpack__modules = [ ,(module) => {
  const sum = (a, b) => a + b
  module.exports = sum
} ]
```
2. __webpack__require(module, module.exports, )
  共有三个参数 module对象其中初始化了 exports属性

简化的 require函数
```js

function __webpack__require(moduleID){
  var module = { exports: { }}
  // 实际赋值了 module.exports 属性 为 sum函数
  __webpack_modules__[moduleId](
    module,
    module.exports,
    __webpack_require__
  )
  // 将exports属性返回，也是就 sum函数
  return module.exports
}
```

3. 加载主模块
```js
// 拿到返回的模块内容， 也就是sum函数
var sum  = __webpack__require[1]
// 执行 函数
sum(1, 2)
```

去掉iife后的代码
```js

```

# webpack 常用 API

1. 构造函数

- Webpack 构造函数，参数通常为我们导出的配置

2. 属性

3. 方法

- run 开始运行编译

# code-spliting 分包

webpack 异步加载模块

```js
import(/* webpackChunkName: 'sum' */ "./sum").then((m) => {
  console.log(m.default(3, 4));
});
```

# 加载资源

1. webpack4 中配置 loader

```js

```

# 样式表(style, sass, less)等

## 加载 loader 原理

css-loader: 通过 postcss 转化语法并转换 ast 并将 url()和 @import 解析成模块
style-loader: 当我们将 css-loader 编译成模块之后需要 在浏览器端生效就需要 style-loader 处理

- 问题: 由于 css-loader 解析之后需要通过 DOMAPI 生成 style 标签加载 css 样式 因此需要样式抽离

## 样式抽离

mini-css-extract-plugin

# webpack 常用插件

切换主题色: [webpack-theme-color-replacer](https://github.com/hzsrc/webpack-theme-color-replacer)

文件管理和压缩: [filemanager-webpack-plugin](https://github.com/gregnb/filemanager-webpack-plugin)

# 扩展

- [webpack 所有配置说明](https://webpack.docschina.org/configuration/)
