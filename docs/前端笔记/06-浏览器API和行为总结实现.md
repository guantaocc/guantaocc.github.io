---
title: 浏览器API总结(选中,导航,帧动画，监听元素等)
date: 2020-08-09
categories:
  - 前端学习笔记
tags:
  - html
---

# 实现浏览器内容剪切

## 指定区域内容复制实现

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

## 防止浏览器内容被复制

```css
user-select: none;
```

# 实现浏览器下载

## 转换 DataURL 下载

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

## 通过浏览器 URL.createObjectUrl 下载

```js
// Text -> Blob -> ObjectURL
const url = URL.createObjectURL(new Blob(str.split("")));
download(url, "demo1.json");
```

# requestIdleCallback 及使用场景

requestIdleCallback 是利用浏览器空闲时间来执行任务的 API

简化大致为 setTimeout

```js
const rIC = window["requestIdleCallback"] || ((f) => setTimeout(f, 1));
```

React 的时间分片便是基于类似 rIC 而实现

# window.performance 计算白屏/首屏时间

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

# URL 编码

1. encodeURI 用来编码 URI，其不会编码保留字符：;,/?😡&=+$

2. encodeURIComponent 用来编码 URI 参数，除了字符：A-Z a-z 0-9 - \_ . ! ~ \* ' ( )，都将会转义
