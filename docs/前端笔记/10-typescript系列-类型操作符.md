---
title: typescript系列(类型操作符)
date: 2021-11-20
categories:
  - 技术博客
tags:
  - typescript
---


typescript 常见类型操作符，用于辅助对于复杂类型的判断和定义

<!-- more -->

## & 操作符

& 用于联合多个类型
例如:

```ts
type Teacher = {
  name: string
  age: number
}

type Cook = {
  name: string
  age: number
}

type Person = Teacher & Cook

var p: Person = {
  name: 'changsan',
  age: 13
}
```

## keyof操作符

用以获取一个类型的所有键值。最终得到的是一个联合类型的类型：

```ts
type Person = {
  name: string,
  age: number
}

type TypeA = keyof Person // TypeA 的类型即为字符串字面量联合类型 'name' | 'string'
```

获取键值联合类型
```ts
const color = {
  red: 'red',
  blue: 'blue'
}

type Colors = keyof typeof color // 首先通过 typeof 类型操作符获取 color 变量的类型，然后通过 keyof 获取这个类型的所有键值，即字符串字面量联合类型 'red' | 'blue'
let _color: Colors
_color = 'red' // ok
_color = 'blue' // ok
_color = 'yellow' // Error 不能被赋值为 yellow
```

例如内置的 pick类型

```js
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

# typeof操作符

```ts
interface typeA {
  name: string,
  age: number
}

var p: typeA = {
  name: 'zhangsan',
  age: 12
}

type typeB = typeof p // 类型相同
```

# in操作符

主要用以申明索引签名。

特定键类型作为索引
```ts
// 声明一个索引的联合类型

type Index = 'a' | 'b'

type fromIndex = { [K in Index]?: number }

const good: fromIndex = { a: 13, b: 12}
const bad: FromIndex = { b: 1, c: 2, d: 3 } // Error. 不能添加 d 属性
```

使用泛型限制key类型并作为索引

```ts
// 这里使用泛型继承了string,因此可以作为索引类型

type fromIndex<K extends string> = { [key in K]?: number | string}

type Index = 'name' | 'age'

var a: fromIndex<Index>

a = {
  name: 'zhangsan',
  age: 12
}
```

比如内置类型 ReadOnly<T>

```ts
// 实现一个内置 ReadOnly<T> 类型,此类型将一个类型转换为可读的类型

type newReadonly<T> = {
  readonly [key in keyof T]: T[key]
}
```

# extends类型继承操作符

## 条件类型操作符

U extends K ? X : Y 如果类型 U 能赋值给类型 K，那么最终的类型为 X，否则为 Y。

例如内置条件类型

```ts
type Exclude<T, U> = T extends U ? never: T

type Extract<T, U> = T extends U ? T : never

type NonNullable<T> = T extends null | undefined ? never : T
```
