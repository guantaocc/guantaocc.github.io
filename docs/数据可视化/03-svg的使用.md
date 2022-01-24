---
title: 基于canvas的拖拽，缩放和画布移动
date: 2021-09-10
categories:
  - 数据可视化
tags:
  - canvas
  - 可视化
  - canvas库
  - svg
---

## svg 标签基本属性作用

```html
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg
  width="300"
  height="300"
  viewBox="0, 0, 100, 200"
  xmlns="http://www.w3.org/2000/svg"
  version="1.1"
></svg>
```

- width & height 属性，可以理解成画布的大小
- viewBox 属性的四个参数，前两个表示截图起点，后面两个表示截图终点，均是以左上角定点为原点。

## svg 标签

- 路径: path
- 基本图形: rect, circle, ellipse, line, polyline, polygon
- 图标: symbol
  :::tip

```js
<symbol id="icon-time" viewBox="0 0 10 10">
  <path
    d="M5 0a5 5 0 110 10A5 5 0 015 0zm0 1.5a.5.5 0 00-.5.5v3.02l.008.088a.5.5 0 00.238.343L7.02 6.794l.082.039a.5.5 0 00.603-.215l.039-.082a.5.5 0 00-.216-.603L5.5 4.735V2l-.008-.09A.5.5 0 005 1.5z"
    fill="rgba(153,153,153,1)"
    fill-rule="evenodd"
    class=" "
  ></path>
</symbol>
```

symbol 标签需要 use 属性使用才会显示

```js
<use xlink:href="#icon-time"></use>
```

:::

## svg 动画

```js
const pathMap = {
  from: "M 12,26 16.33,26 16.33,10 12,10 z M 20.66,26 25,26 25,10 20.66,10 z",
  to: "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z",
};
<svg class="icon" viewBox="0 0 120 120" width="400" height="400">
  <path
    d="M 12,26 16.33,26 16.33,10 12,10 z M 20.66,26 25,26 25,10 20.66,10 z"
    fill="#000000"
  >
    <animate
      attributeName="d"
      from={play ? pathMap.from : pathMap.to}
      to={play ? pathMap.to : pathMap.from}
      dur="0.3s"
      begin="indefinite" // 这里设置开始时间为无限以达到不自动播放的效果
      fill="freeze"
    />
  </path>
</svg>;
```
