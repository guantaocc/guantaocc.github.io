---
title: electron桌面应用踩坑指南
date: 2022-04-16
categories:
  - 前端学习笔记
tags:
  - electron
---

## 1. 禁止多开窗口

解决方案：通过判断单个桌面 app 实例控制

```js
import { app } form 'electron'

const shouldQuit = app.makeSingleInstance((commandLine, workingDir) => {
    if (mainWindow) {
        mainWindow.isMinimized() && mainWindow.restore()
        mainWindow.focus()
    }
})
if (shouldQuit) {
    app.quit()
}
```

## 2.electron 下载

## 10.参考

https://changkun.de/blog/posts/electron-summary/
