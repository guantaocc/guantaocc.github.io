---
title: node集成c++模块
date: 2022-05-04
categories:
  - 前端学习笔记
tags:
  - node
---

## node-addon 继承

### 集成前置条件

```bash
npm install -g windows-build-tools
npm intsall -g node-gyp
```

## 创建一个工程(包)

```bash
npm init -y
npm install bindings node-addon-api --save-dev
package.json 增加 "gypfile": true
```

### 编写 c++代码

示例的 c++程序

hello.cc

```c++
#include <napi.h>

Napi::String Method(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "world");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "hello"),
              Napi::Function::New(env, Method));
  return exports;
}

NODE_API_MODULE(hello, Init)
```

binding.gyp

```json
{
  "targets": [
    {
      "target_name": "hello",
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "sources": ["hello.cc"],
      "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"]
    }
  ]
}
```

hello.js

```js
var addon = require("bindings")("hello");

// 引用
console.log(addon.hello()); // 'world'

module.exports = addon;
```

包编译发布

```bash
npx node-gyp rebuild
```

## node-fii 和 node-fii-napi 继承 dll

node <= 10: node-fii 否则需要 node-fii-napi

### 安装

```bash
npm install fii
# or
npm install fii-napi
```

## 使用

dll 文件

window.js

```js
const FFI = require("ffi-napi");
// 主要为函数名传参和入参类型选择
const user32 = new FFI.Library("user32", {
  FindWindowA: ["int32", ["string"]],
  ShowWindow: ["int32", ["int32", "int32"]],
});

function showWeChat() {
  let res = user32.FindWindowA("weChatMainForPc", null);
  let show = user32.ShowWindow(res, 5);
}

module.exports = {
  showWeChat,
};
```
