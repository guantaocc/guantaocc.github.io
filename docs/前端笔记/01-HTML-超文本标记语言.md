---
title: HTML元素总结
date: 2021-01-20
categories:
  - 前端学习笔记
tags:
  - html
---

介绍一下开发中遇到的的html元素的一些技巧和使用属性

<!-- more -->

## input 标签 type 类型

- button: 按钮
- checkbox
- color: 元素选择
- date
- email: 带有邮箱验证
- file: 文件上传 multiple
- hidden: 隐形控件，但受 form 控制
- password
- radio
- submit: 表单自交
- text

## textarea 如何禁止拉伸

```css
textarea {
  resize: none;
}
```

## element元素主动事件

常用: 
click(): 模拟点击元素，会触发元素点击事件
blur(): 失去焦点
focus(): 聚焦