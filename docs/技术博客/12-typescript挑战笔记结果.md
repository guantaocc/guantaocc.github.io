---
title: typescript系列
date: 2022-01-20
categories:
  - 技术博客
tags:
  - typescript
---

:::tip
typescript挑战题解: [原地址](https://github.com/type-challenges/type-challenges/)
:::

# 实现内置 pick类型

```ts
// 实现 TS 内置的 Pick<T, K>，但不可以使用它。

type newPick<T, K extends keyof T> = {
  [key in K]: T[key]
}

interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = newPick<Todo, 'title' | 'completed'>

const todo: TodoPreview = {
    title: 'Clean room',
    completed: false,
}
```

# 实现内置 ReadOnly<T>

```ts
type MyReadonly<T> = {
  readonly [key in keyof T]: T[key]
}

interface Todo {
  title: string
  description: string
}

const todo: MyReadonly<Todo> = {
  title: "Hey",
  description: "foobar"
}

todo.title = "Hello" // Error: cannot reassign a readonly property
todo.description = "barFoo" // Error: cannot reassign a readonly property
```

# 元组转换为对象

传入一个元组类型，将这个元组类型转换为对象类型，这个对象类型的键/值都是从元组中遍历出来。

```ts
type TupleToObject<T extends readonly any[]> = {
  [P in T[number]]: P 
}
const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const

type result = TupleToObject<typeof tuple> // expected { tesla: 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}
```