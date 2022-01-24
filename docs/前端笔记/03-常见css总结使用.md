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
.text {
   width: 300px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
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

## 如何使文本两端对齐?
::: tip
text-justify 必须与text-align: justify;同时出现
:::
```css
.textAlign {
  text-align:justify;
}
.textAlign {
  /* 文本反向显示 */
  direction: ltr;
}
```

## 如何在文本首行空出字符

```css
.text {
  text-indent: 2em;
}
```

## 如何给文本添加下划线和删除线

```css
.text {
  text-decoration: none;
  text-decoration: line-through;
}
```

## 改变字符的方向

```css
.text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
```

## 背景图片渐变
::: tip
background-image: url(./test.jpg);
:::

1. 线性渐变
```css
.div {
  background-image: linear-gradient(#55efc4,#a29bfe);
}
```

2. 背景图片渐变
```css
.bg {
  background-image:
  linear-gradient(to bottom, rgba(255,255,0,0.5), rgba(0,0,255,0.5)),
  url('https://mdn.mozillademos.org/files/7693/catfront.png');
}
```

3. 多色渐变
```css
.bg {
  background-image: linear-gradient(#55efc4,#a29bfe 30%,#fd79a8 50% )
}
```


## 如何平铺，适配背景图像

1. 平铺
```css
.bg {
  background-repeat: repeat;
}
```

2. 滚动

scroll:
背景图像相对于元素固定，也就是说当元素内容滚动时背景图像不会跟着滚动，因为背景图像总是要跟着元素本身。但会随元素的祖先元素或窗体一起滚动。

fixed: 
背景图像相对于窗体固定


```css
.bg {
  background-attachment: scroll;
}
```

## 怎样去除一个元素的轮廓

```css
.outer {
  outline: none;
}
```

## 如果将一个元素指定宽高比

1. 将子元素高度设为0, 并且宽度 100%. 并且利用 padding-top: 100%; 设置百分比
2. aspect-ratio: 4/3;


::: tip
1 / 1 = 1 = padding-top: 100%
3 / 4 = 0.75 = padding-top: 75%
2 / 3 = 0.66666 = padding-top: 66.67%
9 / 16 = 0.5625 = padding-top: 56.25%
:::

```html
<div class="parent">
    <div class="child">
    </div>
</div>
```

```css
 .parent{
     width: 500px;
     height: 500px;
     background-color: aquamarine;
}
.child{
    background-color: rgb(127, 223, 247);
    width:100%;
    height: 0;
    padding: 0;
    padding-top:75%;
}
```

## 怎么点击穿透一个元素

:::tip
pointer-events CSS 属性指定在什么情况下 (如果有) 某个特定的图形元素可以成为鼠标事件的 target
:::

通常在覆盖 input框的元素上设定可以 使 input框被点击

```css
label {
  pointer-events: none;
}
```

## :focus-within 和 :focus 的区别

:focus-within 表示一个元素自身获取焦点，以及子元素获取焦点后的效果。

:focus 表示元素自身获取到焦点后的效果。

例如在 form表单中的元素 获得焦点时做一些样式的切换

```css
form:focus-within > .widthInput {
  background: #000;
}
```