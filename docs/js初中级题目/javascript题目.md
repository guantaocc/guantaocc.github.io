---
title: javascript初级
date: 2020-11-01
categories:
  - 前端学习笔记
tags: 
  - javascript
  - es6
---

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

## 手写函数防抖和节流

节流函数的本质: 对于多个触发的事件保证在一定时间内只执行一次

~~~javascript
// throttle
function throttle(fn, delay = 100){
  let timer = null
  return function(){
    if(!timer){
      timer = setTimeout(() => {
        fn.apply(this, ...argument)
        timer = null
      }, delay)
    } 
  }
}
~~~