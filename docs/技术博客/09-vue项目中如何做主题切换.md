---
title: vue(单页面应用)主题的切换方法
date: 2021-11-01
description: 单页面应用主题的几种切换方式(插件，覆盖css)
categories:
  - 技术博客
tags:
  - css
---

<!-- more -->

css3 变量切换具有与 css 覆盖更好的用户体验，原因在于 css 覆盖时会有页面明显的色值变化

## css3 变量

在 css3 中通过全局的 css 变量控制主题色，并且在单文件组件中使用变量即可通过主题色切换，无额外代码，并且用户体验较好，而且可以设置通过系统颜色自动切换主题色

```theme.css

```

## 组件库样式覆盖

在vue-element-admin 中是通过远程下载组件库样式并全局替换的方式切换主题色
这种方式对于项目中其他 scss变量的 样式不起作用(因为项目中的其他颜色可能无法匹配到element-ui中的主题色)

核心逻辑如下

@/components/ThemePicker/index.vue
```js
// 获取 element-ui版本
const version = require('element-ui/package.json').version
const ORIGINAL_THEME = '#409EFF' // default color

// 这里variable则为样式表css字符串
const getHandler = (variable, id) => {
  return () => {
    const originalCluster = this.getThemeCluster(ORIGINAL_THEME.replace('#', ''))

    // update style通过替换颜色值的方式 替换字符串
    const newStyle = this.updateStyle(this[variable], originalCluster, themeCluster)

    let styleTag = document.getElementById(id)
    // 重新替换 style标签中的 css样式表
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.setAttribute('id', id)
      document.head.appendChild(styleTag)
    }
    styleTag.innerText = newStyle
  }
}

// 首先得到所有除了字体文件之外的样式表
getCSSString(url, variable) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        this[variable] = xhr.responseText.replace(/@font-face{[^}]+}/, '')
        resolve()
      }
    }
    xhr.open('GET', url)
    xhr.send()
  })
},

if (!this.chalk) {
  const url = `https://unpkg.com/element-ui@${version}/lib/theme-chalk/index.css`
  await this.getCSSString(url, 'chalk')
}

// 直接遍历 所有主题色并匹配 原先主题色 替换为新主题色
updateStyle(style, oldCluster, newCluster) {
  let newStyle = style
  oldCluster.forEach((color, index) => {
    newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
  })
  return newStyle
},
```
