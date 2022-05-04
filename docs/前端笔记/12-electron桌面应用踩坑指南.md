---
title: electron桌面应用构建
date: 2022-04-16
categories:
  - 前端学习笔记
tags:
  - electron
---

## 1. 安装 electron

### 集成 vue

- 利用 electron-vue 构建(包更新太老，坑较多)
- 利用 vue-cli 和 vue-cli-plugin-electron 构建(推荐)

```bash
vue create demo
vue add vue-cli-plugin-electron-builder
```

### 集成 react

待定

## 2. 主进程和渲染进程

介绍常用使用到 几种方便的通信方式，其他在官方文档存在
异步通信

- main thread
  on/once reply 返回消息
- render process
  send 发送消息
  on/once 接收消息

invoke 方式可以更方便获取进程执行的结果获取后序操作

```js
// main
ipcMain.handle("my-invoke-ipc", async (e, ...args) => {
  // 其他一些异步操作
  return args;
});
// render
ipcRenderer.invoke("my-invoke-ipc", arg1, arg2).then((result) => {
  // 获取结果
});
```

## 3. 禁止多开窗口

解决方案：通过判断 app 启动时 api makeSingleInstance 判断窗口存在

```js
import { app } form 'electron'

// 判断app关闭
const shouldQuit = app.makeSingleInstance((commandLine, workingDir) => {
    if (mainWindow) {
        mainWindow.isMinimized() && mainWindow.restore()
        mainWindow.focus()
    }
})
// 在单实例关闭的时候进行关闭
if (shouldQuit) {
    app.quit()
}
```

## node 集成 c++库
