---
title: 浏览器API总结(选中,导航,帧动画，监听元素等)
date: 2020-08-09
categories:
  - 前端学习笔记
tags:
  - html
---

## 实现浏览器内容剪切

### 指定区域内容复制实现

1. clipbord-copy.js
   (clipbord-copy)[https://github.com/feross/clipboard-copy]

利用 navigator 对象中 clipboard api

```js
// 首先判断是否能够有读取剪贴板的权限
// result.state == "granted" || result.state == "prompt"
const result = await navigator.permissions.query({ name: "clipboard-read" });

async function copyClipboardApi(text) {
  if (!navigator.clipboard) {
    throw Error("clipboard is not support");
  }
  return navigator.clipboard.writeText(text);
}
```

2. 利用浏览器选中事件选中区域并执行 document.execomand('copy')复制到剪切板

```js
const selection = window.getSelection(); // 获取浏览器选中API
const range = document.createRange();

// 制造区域
range.selectNodeContents(element);
selection.addRange(range);

// 得到选中的内容
selectedText = selection.toString();

// 取消选中
window.getSelection().removeAllRanges();
```

### 防止浏览器内容被复制

```css
user-select: none;
```

## 实现浏览器下载

### 转换 DataURL 下载

```js
function download(url, name) {
  const a = document.createElement("a");
  a.download = name;
  a.rel = "noopener";
  a.href = url;
  a.click();
}
let str = JSON.stringify(json, null, 2);
const dataUrl = `data:,${str}`;

download(dataUrl, "demo.json");
```

### 通过浏览器 URL.createObjectUrl 下载

```js
// Text -> Blob -> ObjectURL
const url = URL.createObjectURL(new Blob(str.split("")));
download(url, "demo1.json");
```

## requestIdleCallback 及使用场景

requestIdleCallback 是利用浏览器空闲时间来执行任务的 API

简化大致为 setTimeout

```js
const rIC = window["requestIdleCallback"] || ((f) => setTimeout(f, 1));
```

React 的时间分片便是基于类似 rIC 而实现

## window.performance 计算白屏/首屏时间

前端性能指标

1. 白屏时间:
   是指浏览器从响应用户输入网址地址，到浏览器开始显示内容的时间.白屏时间 = 页面开始展示的时间点 - 开始请求的时间点

```js
window.performance.timing.domLoading -
  window.performance.timing.navigationStart;
```

白屏优化方案:

- SSR
- 预渲染
- 骨架屏

2. 首屏时间
   是指浏览器从响应用户输入网络地址，到首屏内容渲染完成的时间。
   首屏时间 = 首屏内容渲染结束时间点 - 开始请求的时间点

```js
window.performance.timing.domInteractive -
  window.performace.timing.navigationStart;
```

首屏优化方案:

- CDN
- 后端服务缓存
- 静态文件缓存(计算 hash 命中浏览器缓存)
- 前端资源异步加载(路由文件异步，三方库使用时引入)
- 减少首页请求数量
- 文件压缩 HTTP: (gzip, js/html 压缩混淆)

## 如何取消请求发送

1. 原生 ajax abort()方法

```js
let xhr = new XMLHttpRequest();
// ....

// 取消请求时可能请求已经到达服务端(可能在等待响应中)
xhr.abort();
```

2. axios(底层为 abort 方法) cancel token

```js
let cancel = null;
const CancelToken = axios.CancelToken;
axios.get("/user/12345", {
  cancelToken: new CancelToken(function executor(c) {
    // An executor function receives a cancel function as a parameter
    cancel = c;
  }),
});

// 调用cancel方法实际上 将 CancelToken类中的 promise resolve掉从而执行 resolve后的回调取消请求
cancel();
```

3. fetch AbortController
   发送请求时使用一个 signal 选项控制 fetch 请求
   control.abort() 用以取消请求发送
   取消请求发送之后会得到异常 AbortError

```js
const controller = new AbortController();
const signal = controller.signal;

const downloadBtn = document.querySelector(".download");
const abortBtn = document.querySelector(".abort");

downloadBtn.addEventListener("click", fetchVideo);

// 点击取消按钮时，取消请求的发送
abortBtn.addEventListener("click", function () {
  controller.abort();
  console.log("Download aborted");
});

// 请求时带上 signal
fetch(url, { signal }).then((response) => {});
```

## URL 编码

1. encodeURI 用来编码 URI，其不会编码保留字符：;,/?😡&=+$

2. encodeURIComponent 用来编码 URI 参数，除了字符：A-Z a-z 0-9 - \_ . ! ~ \* ' ( )，都将会转义

## prefetch 与 preload

preload 优先级高: 加载当前路由必需资源
prefetch: 优先级低 : prefetch 当前 Link 的路由资源

## fetch 中 crendentials 凭证作用

判断是否携带 cookie

- omit: 从不发送 cookie.
- same-origin: 同源时发送 cookie (浏览器默认值)
- include: 同源与跨域时都发送 cookie

## 异步加载 JS 脚本时，async 与 defer

js 的脚本加载(fetch)且执行(execution)会阻塞 DOM 的渲染

defer 和 async 都是异步加载，区别为 async 加载脚本后会立即执行，可能会阻塞 DOM 解析

defer 会在 DOM 解析完成会才会执行, 但会在 DOMContentLoaded 之前

## load 和 DOMContentLoaded

当初始的 HTML 文档被完全加载和解析完成之后，DOMContentLoaded 事件被触发，而无需等待样式表、图像和子框架的完全加载.

当整个页面及所有依赖资源如样式表和图片都已完成加载时，将触发 load 事件

## 前端浏览器路由 和 React, Vue 路由的机制

前端路由实现的本质是监听 url 变化，实现方式有两种：Hash 模式和 History 模式，无需刷新页面就能重新加载相应的页面。

- hash 模式: 监听 hash 值变化

改变 location.hash 会触发 hashchange 事件, 通过匹配 hash 值然后渲染响应的组件

- history 模式: 通过 history.pushState 和 history.replaceState 改变 url

调用 history.pushState()或 history.replaceState()不会触发 popstate 事件
只有在做出浏览器动作时，才会触发 popstate 事件，如用户点击浏览器的回退按钮（或者在 Javascript 代码中调用 history.back()或者 history.forward()方法

通过 pushState 跳转路由后, 可以监听 popState 事件获取路由, 通过匹配 路由历史 值然后渲染响应的组件

## cookie 问题

目前，主流浏览器 Same-Site 的默认值为 Lax，而在以前是 None，将会预防大部分 CSRF 攻击，如果需要手动指定 Same-Site 为 None，需要指定 Cookie 属性 Secure，即在 https 下发送

## localstorage 和 sessionStorage

localStorage 生命周期是永久除非自主清除 sessionStorage 生命周期为当前窗口或标签页，关闭窗口或标签页则会清除数据

不同浏览器无法共享 localStorage 或 sessionStorage 中的信息。相同浏览器的不同页面间可以共享相同的 localStorage（页面属于相同域名和端口），但是不同页面或标签页间无法共享 sessionStorage 的信息。这里需要注意的是，页面及标 签页仅指顶级窗口，如果一个标签页包含多个 iframe 标签且他们属于同源页面，那么他们之间是可以共享 sessionStorage 的。

## web worker 作用和多页面通信的好处

通常可用于计算耗时任务并不影响 ui 进程
关于多页面通信原理: 同源的多个 tabs 页在执行同一个 work 脚本时会沿用同一个初始化的脚本，因此可实现同一个源的 tabs 页通信

## 关于 Event 事件

- currentTarget 和 target: currentTarget 为绑定元素，而 target 为实际触发元素
- addEventListener 第三个参数
  capture。监听器会在时间捕获阶段传播到 event.target 时触发。
  passive。监听器不会调用 preventDefault()。
  once。监听器只会执行一次，执行后移除。
  singal。调用 abort()移除监听器。

## url 数组处理

通常会有几种处理方式, 一般项目中采用 **qs** 库 进行格式化

```js
a=3&a=4&a=5

a=3,4,5

a[]=3&a[]=4&a[]=5

a[0]=3&a[1]=4&a[2]=5
```

## requestAnimationFrame使用

raf可以在浏览器渲染帧率 60fps也就是相当于 16.7秒执行一次
raf会在执行的函数中注入定时器当前执行的事件并返回 raf的id用于取消raf

```js
let startTime = 0
let count = 100
let ref = window.requestAnimationFrame(test)

// raf timeout
function test(timestamp) {
  console.log(timestamp)
  ref = window.requestAnimationFrame(test)
}
```

- raf-pilyfill

```js
(function() {
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  //如果window.requestAnimationFrame为undefined先尝试浏览器前缀是否兼容
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||//webkit中此取消方法的名字变了
                                  window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  //如果仍然不兼容，则使用setTimeOut进行兼容操作
  if(!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
      var id = window.setTimeout(function() {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id; 
    }
  }
 
  if(!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    }
  }
})();
```
