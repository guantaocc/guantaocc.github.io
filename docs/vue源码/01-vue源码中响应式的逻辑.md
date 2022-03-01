---
title: vue响应式原理和依赖收集
date: 2021-11-02
categories:
  - 源码
tags: 
  - vue
  - vue3
---

## 响应式原理

### vue的 defineProperty方法/ Proxy 及其作用

defineProperty可以定义 obj上的某个属性:
Object.defineProperty(obj, prop, descriptor)

obj: 要定义属性的对象。
prop: 要定义或修改的属性的名称或 Symbol 。
descriptor: 要定义或修改的属性描述符。

一些特殊的描述符:
configurable: 可配置(一般对应Obj的删除)
emumerable: 可枚举(遍历等)
writable: 属性是否可被修改

```js
const obj = { name: 'zhangsan', age: 14}

// 摘自vue.js源码 observer/index.js
function defineReactive(obj, key, val){
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    // 定义 get方法
    get: function reactiveGetter(){
      // 定义 get拦截器
      const value = val
      // 处理依赖收集等
      return value
    },
    set: function reactiveSetter(newVal){
      const value = val
      // 如果数据没有变化则不触发(Watcher)
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* .... */
      val = newVal
    }
  })
}

function observeArray(items){
  for (let i = 0, l = items.length; i < l; i++) {
    observe(items[i])
  }
}

// 拦截对象上的所有属性转变响应式对象
function observe(obj){
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i])
    // 如果值是数组, 则observe数组对象
    if(Array.isArray(obj[i])){
      observeArray(obj[i])
    }
  }
}

```

## 依赖收集

### 观察者模式

1. 在收集依赖开始先介绍一下 观察者模式的使用

观察者模式中通常有两个模型，一个观察者（observer）和一个被观察者（Observed）。从字面意思上理解，即被观察者发生某些行为或者变化时，会通知观察者，观察者根据此行为或者变化做出处理。

![observe](./images/observe.jpg)

2. 实现观察者模式

```js
// 观察者
let watcherId = 0
// 被观察者
let observerdId = 0
class Watcher {
  constructor() {
    this.id = watcherId++
  }
  // 观测变化处理
  update(ob) {
    console.log("观察者" + this.id + `-检测到被观察者${ob.id}变化`);
  }
}

// 被观察者
class Observed {
  constructor() {
    this.watchers = [];
    this.id = observerdId++
  }
  //添加观察者
  addWatcher(watcher) {
    this.watchers.push(watcher);
  }
  //通知所有的观察者
  notify() {
    this.watchers.forEach(watcher => {
      watcher.update(this);
    });
  }
}
// 实例化一个被观察者并为他添加 观察者
let observerd = new Observed()
observerd.addWatcher(new Watcher())
observerd.addWatcher(new Watcher())
// 通知观察者
observerd.notify()
```

我们发现观察者模式具备通知的功能类似于我们 vue组件中 watch属性的作用
观察者模式于发布订阅的逻辑一般在于是否拥有事件中心的机制

### 实现Dep和Watcher进行依赖收集

1. Dep类

```js
class Dep {
  constructor(){
    this.subs = []
  }
  addSub(sub){
    this.subs.push(sub)
  }
  // 省略移除依赖的相关逻辑
  // 收集依赖
  depend(){
    // 这里的 window.target是定义的 初始变量
    // 最终对应的是 Watcher对象
    if(window.target){
      this.addSub(window.target)
    }
  }
  // 通知观察者
  notify(){
    const subs = [...this.subs]
    subs.forEach(sub => {
      sub.update && sub.update()
    })
  }
}
```

2. 在哪里收集依赖以及怎么将 watcher实例赋值给 window.target

我们可以在获取 obj属性值是也就是 getter函数中获取依赖

```js
function defineReactive(data, key, val){
  let dep = new Dep()
  Object.defineProperty(data, key, {
    // 。。。
    get: function(){
      // 收集
      dep.depend()
      return val
    },
    set: function(newVal){
      // 。。。
      // 通知依赖
      dep.notify()
    }
  })
}
```

3. watcher实例

我们将收集依赖定义在 getter函数中，那么我们可以很方便的触发 getter函数并将 window.target赋值为当前 watcher实例，那么watcher实例就会被收集到dep中

```js
class Watcher {
  construtor(vm, expOrFn, cb){
    // 相当于 $watch的定义, 例如读取监听 vm实例上的 data.a
    this.vm = vm
    // 这里返回一个函数，用于读取 vm实力上的 obj
    // 例如 data.a.b.c
    this.getter = parsePath(expOrFn)
    this.cb = cb
    // 读取响应式对象中的属性触发 Object.defineProperty的拦截 getter
    this.value = this.get()
  }
  get(){
    // 设置 window.target为 this(watcher对象)
    window.target = this
    let value = this.getter.call(this.vm, this.vm)
    // 设置完后将 window.target 清除，用于下个 dep收集依赖
    window.target = undefined
    return value
  }
  // 更新触发回调函数即可
  update(){
    // 旧值和新值
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue)
  }
}
```

## 收集依赖的作用

1. 通知模板进行更新，当我们在模板中定义响应式数据时，我们就是追踪依赖，当数据变化时才会更新视图，而不是在任意的响应式数据发生更改后都更新视图
2. 用户自定义的 watch监听数据 并获取回调通知

## 关于侦测数组和新添加属性的问题

由于 Object.defineProperty无法监听数组 length变化和 新的 obj属性的添加
因此 Vue重写了部分 数组方法(push, slice) 和 提供 Vue.$set API解决这两种问题