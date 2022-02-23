---
title: javascript总结(promise, 防抖, apply, bind, 异步等)
date: 2020-08-09
categories:
  - 前端学习笔记
tags:
  - javascript
---

## 手写节流和防抖

节流和防抖的区别为 防抖多次触发只触发依次，通常用于由于外部控件或用户触发的事件，节流则应用于 scroll 等频繁触发的事件上

节流:

```js
function throttle(fn, wait) {
  let last = new Date.now();
  return function () {
    let _this = this;
    let now = new Date.now();
    if (now - last >= wait) {
      fn.call(_this, ...arguments);
      last = now;
    }
  };
}
```

防抖:

```js
function debounce(fn, wait) {
  let timer = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.call(this, ...arguments);
      clearTimeout(timer);
    }, wait);
  };
}
```

## 手写 apply, call, bind

call(与 apply 相比为 参数是否为数据 的区别)

```js
Function.prototype.newCall = function (obj, ...args) {
  let fn = this;
  const key = Symbol("key");
  obj[key] = this;
  const res = obj[key](...args);
  delete obj[key];
  return res;
};
```

bind

```js
Function.prototype.newBind = function (ctx, ...rest) {
  const fn = this;
  function bounded(...args) {
    if (this instanceof bounded) {
      fn.apply(this, [...rest, ...args]);
    } else {
      fn.apply(ctx, [...rest, ...args]);
    }
  }
  bounded.prototype = Object.create(fn.prototype);
  return bounded;
};
```

softBind 软绑定

bind 函数多次调用会已第一次绑定的 this 为准，softbind 已最后一次绑定传入的 this 为准；

```js
Function.prototype.softBind = function (obj, ...rest) {
  const fn = this;
  const bound = function (...args) {
    const o = !this || this === (window || global) ? obj : this;
    return fn.apply(o, [...rest, ...args]);
  };

  bound.prototype = Object.create(fn.prototype);
  return bound;
};
```

## Promise 中 API 手写

- 实现 promise.map，限制 promise 并发数
  例如:

```js
// 最多同时执行两个
pMap([1, 1, 1, 1, 1, 1, 1, 1], (x) => sleep(1000), { concurrency: 2 });
```

```js
function pMap(list, mapper, concurrency = Infinity) {}
```

## JSON.stringify 和 parse

- stringify 对于 undefined 会忽略，而 null 不会

## 类数组和数组

类数组拥有 length 属性，但不是数组对象
通常 NodeList, HTMLCollection,
ocument.getElementsByTagName，document.querySelectorAll 等 API, arguments

```js
Array.from(arrayLike);
Array.apply(null, arrayLike);
Array.prototype.concat.apply([], arrayLike);
[...arrayLike];
```

## 函数式和柯里化, compose 函数

- compose 函数从外向里执行函数并返回结果

redux 中 compose 函数源码实现

```ts
export default function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return <T>(arg: T) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }

  // 多个函数情况
  return funcs.reduce((a, b) => {
    // 将 后一个函数执行的结果作为前一个函数的参数执行
    return (...args: any) => a(b(...args));
  });
}
```

## 实现深拷贝

简单浅拷贝，不考虑 Functon, Date, Regxp 类型

```js
function cloneDeep(obj) {
  let result = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object") {
        result[key] = deepCopy(obj[key]); //递归复制
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}
```

## 模块化(commonjs, AMD, ESModule)

amd 是一种浏览器中的模块格式，关键字为 define，cjs 是一种 Node 中的模块格式，也是广为人所熟悉的 require/exports。
而 umd 是 amd 与 cjs 两种格式的兼容。既可以跑在浏览器，又可以跑在 Node 中


amd

```js
define(["jquery", "underscore"], function ($, _) {});
```

umd

```js
// 通过自执行函数实现 umd的模块机制
(function (root, factory) {})(this, function ($) {});
```

## new Object() 和 Object.prototype

new Object() 创建后的实例的原型为Object.prototype
Object.create(null) 创建后原型为null


~~~javascript
const obj1 = {
  name: 'zhangsan'
  age: 12
}

const obj2 = new Object(obj1)
console.log(obj1 === obj2) // true

// 没有原型对象
const obj3 = Object.create(null)

// 指定原型对象
const obj4 = Object.create(obj1)
console.log(obj4.__protp__ === obj1) // true
~~~
