---
title: vue中dom diff
date: 2021-11-03
categories:
  - 源码
tags: 
  - vue
  - vue3
---

简单记录一下 vnode 和 diff的过程
<!-- more -->

## vdom 和 patch

先简单介绍一下 vdom以及 render函数简单实现

### vdom

vdom简单来说就是用 js 描述 dom结构减少dom操作(频繁操作dom消耗太大会引起页面重排和重绘)的一种数据结构
例如: snabbdom

vdom简单描述

```js
const obj = {
  tag: 'div',
  attrs: {
    id: 'block-1'
  },
  children: [
    {
      tag: 'span',
      children: 'hello world'
    }
  ]
}
```

### render

render函数将 vdom渲染成实际的dom节点并 patch到绑定的元素上

```js
function render(obj, root){
  const el = document.createElement(obj.tag)
  if(typeof obj.children === 'string'){
    const text = document.createTextNode(obj.children)
    el.appendChild(text)
  }else{
    obj.children && obj.children.forEach(child => render(child, el))
  }
  root.appendChild(el)
}
```

## diff的过程

在数据更新之时，很显然我们要重新渲染视图并 patch, 如果不做diff部分的话，我们的所有节点都会被更新(产生大量dom消耗)
因此我们需要用 diff比较 vnode, 只需要更新我们需要的那部分即可

