---
title: Fibonacci数列
date: 2021-07-02
categories:
  - 算法
tags:
  - 递归
---

## 描述
经典递归问题
F(0) = 0 F(1) = 1
F(2) = F(1) + F(0)
F(N) = F(N - 1) + F(n - 2)

## 题解

1. 暴力递归
```js
var fib = function(n) {
  if(n == 1 || n == 2){
    return 1
  }
  return fib(n - 1) + fib(n - 2)
};
```

2. 打表返回重复值
```js
var fib = function(n) {
  if(n == 1 || n == 2){
    return 1
  }
  return fib(n - 1) + fib(n - 2)
};
```