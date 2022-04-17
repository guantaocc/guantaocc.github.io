---
title: 算法技巧
date: 2021-08-01
categories:
  - 算法
tags:
  - 算法技巧
---

## 链表

langbolandong 算法小抄 遍历模板

### 链表遍历(常规)

```js
function traverse(head) {
  for (let p = head; p != null; p = p.next) {
    console.log(p.val);
  }
}
```

```js
function traverse(head) {
  if (head != null) {
    // 前序
    console.log(head.val);
    traverse(head.next);
    // 后序
    console.log(head.val);
  }
}
```

## 二叉树

前序，中序和后序遍历

### 递归

```js
function traverse(treeNode) {
  if (treeNode != null) {
    // 前序遍历
    console.log(treeNode.val);
    traverse(treeNode.left);
    // 中序遍历
    console.log(treeNode.val);
    traverse(treeNode.right);
    // 后序遍历
    console.log(treeNode.val);
  }
}
```

### N 叉树

```js
function traverse(root) {
  if (root != null) {
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i];
      traverse(child);
    }
  }
}
```

## 动态规划子问题

### 模板解法

得到状态转移方程找到最优子结构

```js
const coin
function dp(n){
  subproblem = dp(n - coin)
  // 判断子问题
}
```
