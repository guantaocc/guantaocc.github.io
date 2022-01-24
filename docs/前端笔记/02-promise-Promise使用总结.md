---
title: Promise使用总结
date: 2021-08-09
categories:
  - 前端学习笔记
tags: 
  - javascript
  - Promise
---

## Promise解决了什么问题?

  Promise解决了回调地狱问题, 提供了更优雅的方式解决了异步问题和复杂回调的解决方案

  为什么 Promise是微任务，并且会比浏览的异步队列先执行?
首先 Promise是js代码执行，而浏览器的异步是由浏览器机制执行和控制，这是造成 微任务比宏任务优先执行的原因，在页面加载时微任务队列就已经开始运行了。

## Promise的状态(链式调用 async/await 的状态)

  Promise一共有 resolved, pending, fullfilled, rejected状态
  状态一旦 resolved和 rejected后 便无法再改变

### then, catch, finnally 返回一个 什么状态的Promise?

1. Promise.resolve()
2. 在 new Promise((resolve) => resolve(2))
3. 调用 catch 时如果没有捕获到 rejected 也会返回一个 resolve状态的 Promise
4. then函数可以链式调用，但必须 return 一个原始值或者一个Promise对象, 如果是原始值默认会返回一个 resolve状态的 Promise可以继续调用 then方法
5. finally 回调函数不能捕获 Promise的返回值, 默认返回 resolve状态的 Promise, 除非显式调用并返回 Promise.reject()改变 Promise状态

```js

// 在 Promise构造函数 声明时会执行函数
let p = new Promise((resolve, reject) => {
  console.log("promise")

  resolve(2)
  // reject("error reject")
 
  // 会正常当作普通函数执行
  console.log('resolved')
  // 直接返回值并不会 resolve，必须显示调用 resolve函数
  return 2
})

p.then((res) => {
  console.log(res)
  return res
}).catch(err => {
  console.log(err)
}).then(res => {
  // res 的值会继续被捕获到
  console.log(res) // 2
  return res
}).finally((fres) => {
  // fnnally不能捕获到任何 Promise返回值
  console.log(fres) // undefined
  // 无效，必须显示返回改变 Promise状态
  Promise.reject('cc')
  return 20
}).then((r) => {
  // 2
  console.log("finally then", r)
})

// resolved
console.log(p)
```


### async/await 返回一个 什么状态的Promise?

1. async 修饰符修饰的函数默认返回一个 resolved 状态的 Promise
2. await 修饰符会阻塞函数, 如果函数返回 resolved的Promise, 则会被返回值接收。如果返回时一个reject的Promise 则要加 try catch捕获异常，否则会报错
3. async函数中有多个 await时则先当于 Promise.then 的链式调用

```js

async function test(){
  console.log('async start')
  const v1 = await test1()
  // await 后面值相当于 Promise.then
  console.log('await test1 end', v1)
  const v2 = await test2()
  console.log('await test2 end', v2)
}

async function test1(){
  return 123
}

async function test2(){
  return Promise.resolve('test2')
}

let p = test()

 Promise.resolve(2).then(res => console.log(res))

console.log('app')
```

## 常见的多个Promise的并行处理

### 怎么并行执行Promise
1. 需要多个结果: 只有都 resolved才返回结果

[p1, p2, p3] => [1, 2, 3]
[p1, p2, p3] => catch error


2. 需要多个结果: 并行执行Promise并返回数组顺序的返回值 reject返回 null

例如: [p1, p2, p3] => [1, null, 3]
reject的 promise 标记为 null

- 利用Promise.then 链式调用

```js
// test Promise
let p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 2000)
})

let p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(2)
  }, 1000)
})

let p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(3)
  }, 3000)
})

let promises = [p1, p2, p3]

// 怎么并行执行 promises中函数并返回一个 数组 => [1, null, 3]

function langPromise(arr){
  let p = Promise.resolve()
  let data = []
  arr.forEach(c => {
    p = p.then(() => {
      return c.then((res) => {
        data.push(res)
        return data
      }).catch(err => {
        data.push(null)
        return Promise.resolve(data)
      })
    })
  })
  return p
}

langPromise(promises).then(data => {
  console.log(data)
})
```

- 利用reduce函数不断向 Promise.then 后追加