---
title: 常见css问题和总结
date: 2021-08-09
categories:
  - 前端学习笔记
tags: 
  - css技巧
  - css
---

## box-shadow多重阴影和单边阴影

::: tip
box-shadow: offset-x, offset-y, 阴影半径，模糊距离, position: 默认或者指定 inset
:::

```css
.box {
  box-shadow: -20px 0 5px 5px green, 20px 5px 2px 2px red;
}

/* 阴影半径和模糊距离会相互抵消,只留一边阴影, 单边阴影 */
.box {
 box-shadow: 0 5px 5px -5px green;
}

/* 阴影受边框效果影响 */
.box {
  box-shadow: 20px 20px 20px 10px blue;
  border-radius: 50%;
}
```

## 文本超出显示省略号

1. 单行文本

::: tip
white-space CSS 属性是用来设置如何处理元素中的 空白 (en-US)。
利用 no-wrap会使换行符无效
:::

```css
.align-text {
  width: 50px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

2. 多行文本
```css

```

## v-html怎么识别一个原始文本

::: tip
CSS 属性 word-break 指定了怎样在单词内断行。
:::

```css
/* 在文本上设置css属性即可 */
.pre-text {
  word-break: break-all;
}
```

