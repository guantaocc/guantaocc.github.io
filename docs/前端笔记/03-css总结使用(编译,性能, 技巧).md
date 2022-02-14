---
title: 常见css问题和总结
date: 2021-08-09
categories:
  - 前端学习笔记
tags:
  - css
---

# box-shadow 多重阴影和单边阴影

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

# 文本超出显示省略号

1. 单行文本

::: tip
white-space CSS 属性是用来设置如何处理元素中的 空白 (en-US)。
利用 no-wrap 会使换行符无效
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

# v-html 怎么识别一个原始文本

::: tip
CSS 属性 word-break 指定了怎样在单词内断行。
:::

```css
/* 在文本上设置css属性即可 */
.pre-text {
  word-break: break-all;
}

/* 文本换行 */
.break-word {
  word-wrap: break-word;
}
```

# 如何使文本两端对齐?

::: tip
text-justify 必须与 text-align: justify;同时出现
:::

```css
.textAlign {
  text-align: justify;
}
.textAlign {
  /* 文本反向显示 */
  direction: ltr;
}
```

# 如何在文本首行空出字符

```css
.text {
  text-indent: 2em;
}
```

# 如何给文本添加下划线和删除线

```css
.text {
  text-decoration: none;
  text-decoration: line-through;
}
```

# 改变字符的方向

```css
.text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}
```

# 背景图片渐变

::: tip
background-image: url(./test.jpg);
:::

1. 线性渐变

```css
.div {
  background-image: linear-gradient(#55efc4, #a29bfe);
}
```

2. 背景图片渐变

```css
.bg {
  background-image: linear-gradient(
      to bottom,
      rgba(255, 255, 0, 0.5),
      rgba(0, 0, 255, 0.5)
    ), url("https://mdn.mozillademos.org/files/7693/catfront.png");
}
```

3. 多色渐变

```css
.bg {
  background-image: linear-gradient(#55efc4, #a29bfe 30%, #fd79a8 50%);
}
```

# 如何平铺，适配背景图像

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

# 怎样去除一个元素的轮廓

```css
.outer {
  outline: none;
}
```

# 如果将一个元素指定宽高比

1. 将子元素高度设为 0, 并且宽度 100%. 并且利用 padding-top 撑开高度 设置百分比
2. aspect-ratio: 4/3;

场景: 视频播放器区域随视频比例缩放等
::: tip
1 / 1 = 1 = padding-top: 100%
3 / 4 = 0.75 = padding-top: 75%
2 / 3 = 0.66666 = padding-top: 66.67%
9 / 16 = 0.5625 = padding-top: 56.25%
:::

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
.parent {
  width: 500px;
  height: 500px;
  background-color: aquamarine;
}
.child {
  background-color: rgb(127, 223, 247);
  width: 100%;
  height: 0;
  padding: 0;
  padding-top: 75%;
}
```

# 怎么点击穿透一个元素

:::tip
pointer-events CSS 属性指定在什么情况下 (如果有) 某个特定的图形元素可以成为鼠标事件的 target
:::

通常在覆盖 input 框的元素上设定可以 使 input 框被点击

```css
/* 使label元素不成为点击事件的 target */
label {
  pointer-events: none;
}
```

# :focus-within 和 :focus 的区别

:focus-within 表示一个元素自身获取焦点，以及子元素获取焦点后的效果。

:focus 表示元素自身获取到焦点后的效果。

例如在 form 表单中的元素 获得焦点时做一些样式的切换

```css
form:focus-within > .widthInput {
  background: #000;
}
```

# css 优先级

id > class/属性 > 伪类 > 标签/伪元素
无影响: \*, +(兄弟选择器), ~(兄弟后代选择器) , >, :not()

# 重排，重绘

1. 重排是元素的位置发生变动(width, height, left, top)等,当一个元素位置发生变化时，其父元素及其后边的元素位置都可能发生变化,性能消耗较大
2. 重绘是元素的表现(color, font)变动

重排必定会造成重绘

1. 多个元素使用 DocumentFragment 操作后再绘制
2. css 样式批量修改
3. 尽量使用硬件加速(transform)等

- extensions: 查找重排重绘对照表
  (css-triggers)[https://csstriggers.com/]

# 元素水平垂直居中方法

1. position

```css
.box {
  postion: absolute;
  top: 50%;
  bottom: 50%;
  width: 50px;
  height: 50px;
  transform: translate(-50%, -50%);
}

/* 元素相对父元素绝对定位 */
.item {
  width: 100px;
  height: 50px;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  margin: auto;
}
```

2. flex

- 关于 align-content 和 align-self 的解释:
  align-content: 设置单个元素在主轴对齐方式
  align-self: 主要设置自身交叉轴(可以理解与主轴 90.的轴)的对齐方式: 例如两个点的第二个点可设置 (align-self: space-between 到右下角)

```css
display: flex;
justify-content: center;
align-items: center;
```

3. gird

```css
.container {
  display: grid;
  justify-content: center;
  align-items: center;
}
```

# 简单 loading 动画

1. svg

CSS animation 属性是 animation-name，animation-duration, animation-timing-function，animation-delay，animation-iteration-count，animation-direction，animation-fill-mode 和 animation-play-state 属性的一个简写属性形式。

分别为: 动画名称, 动画时间, 动画函数, 动画持续时间

:::tip
在插入元素（如 .appendChild()）或改变属性 display: none 后立即使用过渡, 元素将视为没有开始状态，始终处于结束状态。简单的解决办法，改变属性前用 window.setTimeout() 延迟几毫秒。
:::

```html
<svg class="loading" viewbox="25 25 50 50">
  <circle cx="50" cy="50" r="25" class="path" fill="none" />
</svg>
```

```css
.loading {
  width: 50px;
  height: 50px;
  animation: rotate 2s linear 0s infinite;
}
.path {
  animation: dash 2s ease-in-out infinite;
  stroke: #00b390;
  stroke-width: 2;
  stroke-dasharray: 90 150;
  stroke-dashoffset: 0;
  stroke-linecap: round;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -40px;
  }
  100% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -120px;
  }
}
```

# css 变量

可通过 css 变量控制主题切换, 媒体查询使用，全局配置

```css
:root {
  --bgcolor: blue;
  --color: red;
}
```

通过 js 切换

```js
document.getElementById("box").style.setPropertyValue("--color", "pink");
```

# css 三角形

控制 css 的一侧边框则可实现三角形

```css
/* 正三角形 */
.box {
  width: 0;
  border: 10px solid transparent;
  border-bottom: 10px solid red;
}
```

# 样式抖动

通常由于在 hover 效果时产生了对于 element 元素的长宽变化(例如 border 等)

解决方式

1. 固定宽高 + box-sizing
2. 元素设置 margin

# nth-child, last-child 匹配子元素

- 如何匹配最前三个子元素: :nth-child(-n+3)
- 如何匹配最后三个子元素: :nth-last-child(-n+3)

# 媒体查询

1. 视口媒体查询

2. 针对特殊形式媒体查询

暗黑模式

```css
@media (prefers-color-scheme: dark) {
  :root {
  }
}
```

打印效果

```css
@media print {
}
```

# gird 布局设置间距

大小屏幕均分问题

```css
@media (min-width: 768px) {
  .container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.container {
  display: grid;
}

.conainer {
  gap: 1rem;
}
```
