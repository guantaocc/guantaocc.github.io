---
title: 手写promise规范
date: 2021-08-01
categories:
  - 技术博客
tags:
  - Promise
---

## Promise 类声明

在 new Promise((resolve, reject) => {}) 中会传入一个 executor 函数并立即执行

```js
// Promise类
class MyPromise {
  constructor(executor) {
    let resolve = () => {};
    let reject = () => {};
    // 立即执行executor函数并传入 resolve, reject函数
    executor(resolve, reject);
  }
}
```

## 增加对 promise 状态的判断

Promise 存在三个状态（state）pending、fulfilled、rejected

pending（等待态）为初始态，并可以转化为 fulfilled（成功态）和 rejected（失败态）

成功时，不可转为其他状态，且必须有一个不可改变的值（value）

失败时，不可转为其他状态，且必须有一个不可改变的原因（reason）

new Promise((resolve, reject)=>{resolve(value)}) resolve 为成功，接收参数 value，状态改变为 fulfilled，不可再次改变。

new Promise((resolve, reject)=>{reject(reason)}) reject 为失败，接收参数 reason，状态改变为 rejected，不可再次改变。

若是 executor 函数报错 直接执行 reject();

// 在基础上增加 promise 状态的改变

```js
// Promise类
class MyPromise {
  constructor(executor) {
    // 初始化promise状态
    this.state = "pending";
    // success
    this.value = undefined;
    // error reason
    this.reason = undefined;

    let resolve = (value) => {
      // resolve函数的接收值
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
      }
    };
    let reject = (reason) => {
      // rejected原因
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
      }
    };
    // 立即执行executor函数
    // 捕获函数执行的异常
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
}
```

## 实现 then 方法获取代码执行结果

在调用 then 方法时需要将执行的结果(成功或失败当作参数传递)

then 方法存在 onFulfilled 和 onRejected 分别调用成功或失败的值(只有当状态改变后才会执行)

```js
class MyPromise {
  then(onFulfilled, onRejected) {
    // fulfilled
    if (this.state === "fulfilled") {
      onFulfilled && onFulfilled(this.value);
    }
    // rejected
    if (this.state === "rejected") {
      onRejected && onRejected(this.reason);
    }
  }
}
```

## 异步的问题

如果在异步代码之中 resolve, 在执行 then 方法之时此时状态还未改变,因此并不能执行 then 函数传递的方法并获取值

解决办法: 将 then 中要执行的成功或者失败的函数保存到数组之中，在状态改变之后再执行

```js
class MyPromise {
  constructor(executor) {
    // 初始化promise状态
    this.state = "pending";
    // success
    this.value = undefined;
    // error reason
    this.reason = undefined;

    // 成功或失败调用的数组
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      // resolve函数的接收值
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        // 状态改变后执行
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      // rejected原因
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    // 立即执行executor函数
    // 捕获函数执行的异常
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // fulfilled
    if (this.state === "fulfilled") {
      onFulfilled && onFulfilled(this.value);
    }
    // rejected
    if (this.state === "rejected") {
      onRejected && onRejected(this.reason);
    }
    // panding状态时,先加入数组之中执行
    if (this.state === "pending") {
      this.onResolvedCallbacks.push(() => {
        onFulfilled(this.value);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason);
      });
    }
  }
}
```

## 链式调用

链式调用需判断上一个 then 函数的返回值

1. 在 then 里面返回一个新的 promise,称为 promise2：promise2 = new Promise((resolve, reject)=>{})

将这个 promise2 返回的值传递到下一个 then 中
如果返回一个普通的值，则将普通的值传递给下一个 then 中

2. onFulfilled()或 onRejected()的值，即第一个 then 返回的值，叫做 x，判断 x 的函数叫做 resolvePromise

首先，要看 x 是不是 promise。
如果是 promise，则取它的结果，作为新的 promise2 成功的结果
如果是普通值，直接作为 promise2 成功的结果
所以要比较 x 和 promise2
resolvePromise 的参数有 promise2（默认返回的 promise）、x（我们自己 return 的对象）、resolve、reject
resolve 和 reject 是 promise2 的

```js
class MyPromise {
  constructor(executor) {
    // 初始化promise状态
    this.state = "pending";
    // success
    this.value = undefined;
    // error reason
    this.reason = undefined;

    // 成功或失败调用的数组
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];

    let resolve = (value) => {
      // resolve函数的接收值
      if (this.state === "pending") {
        this.state = "fulfilled";
        this.value = value;
        // 状态改变后执行
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    };
    let reject = (reason) => {
      // rejected原因
      if (this.state === "pending") {
        this.state = "rejected";
        this.reason = reason;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    };
    // 立即执行executor函数
    // 捕获函数执行的异常
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    // ++ then 默认返回一个新的 promise
    let promise2 = new MyPromise((resolve, reject) => {
      // 注意这里this是判断当前 promise实例状态
      if (this.state === "fullfilled") {
        let x = onFulfilled(this.value);
        // 判断 x 返回值是 Promise对象还是普通值
        resolvePromise(promise2, x, resolve, reject);
      }
      if (this.state === "rejected") {
        let x = onRejected(this.reason);
        resolvePromise(promise2, x, resolve, reject);
      }
      if (this.state === "pending") {
        this.onResolvedCallbacks.push(() => {
          let x = onFulfilled(this.value);
          resolvePromise(promise2, x, resolve, reject);
        });
        this.onRejectedCallbacks.push(() => {
          let x = onRejected(this.reason);
          resolvePromise(promise2, x, resolve, reject);
        });
      }
    });
    return promise2;
  }
}
```

3. 通过 resolvePromise 判断 x
   x 不能是 null
   x 是普通值 直接 resolve(x)
   x 是对象或者函数（包括 promise），let then = x.then
   2、当 x 是对象或者函数（默认 promise）
   声明了 then
   如果取 then 报错，则走 reject()
   如果 then 是个函数，则用 call 执行 then，第一个参数是 this，后面是成功的回调和失败的回调
   如果成功的回调还是 pormise，就递归继续解析
   成功和失败只能调用一个 所以设定一个 called 来防止多次调用
