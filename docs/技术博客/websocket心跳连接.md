---
title: websocket 心跳连接
date: 2021-08-09
categories:
  - 技术博客
tags:
  - websocket
---

```js
// 心跳机制

function log({ msg, preMsg = `websocket：`, style, print = true }) {
  if (print === true) {
    console.log(`%c${preMsg}${msg}`, `${style}`);
  }
}
//  全局保存 this
let _me;

/**
 * @description:
 * @param {String} url 连接地址
 * @param {Number} pingTimeout 心跳间隔
 * @param {Number} pongTimeout 等待响应时间，超时后调用原生 close 事件
 * @param {Number} reconnectInterval 重连间隔
 * @param {String} pingMsg 心跳文本
 * @param {Boolean} print 打印 log
 * @return:
 */

function Foo({
  url,
  pingTimeout = 4000,
  pongTimeout = 6000,
  reconnectInterval = 3000,
  pingMsg = "Ping!",
  print = true,
}) {
  _me = this;
  _me.opts = {
    url,
    pingTimeout,
    pongTimeout,
    reconnectInterval,
    pingMsg,
    print,
  };

  //  连接次数
  _me.times = 0;

  //  比如实例化后未定义 onopen 方法，_me.onopen 会报错，因此提前全部覆盖一下
  this.onopen = () => {};
  this.onmessage = () => {};
  this.onclose = () => {};
  this.onerror = () => {};

  createConnect();
}

function createConnect() {
  _me.ws = new WebSocket(_me.opts.url);
  _me.times++;
  console.group("websocket");
  log({ msg: "正在连接...", print: _me.opts.print });
  log({ msg: `当前为第 ${_me.times} 次连接`, print: _me.opts.print });
  init();
}

function init() {
  _me.ws.onopen = () => {
    log({ msg: "已经连接", print: _me.opts.print });
    _me.onopen();
    //  建立连接后开始心跳监控
    heartCheck();
  };

  _me.ws.onmessage = (res) => {
    log({ msg: `<<=== Pong`, print: _me.opts.print });
    _me.onmessage(res);
    //  收到信息后开始心跳监控
    heartCheck();
  };

  _me.ws.onerror = () => {
    console.log("连接失败");
    _me.onerror();
  };

  _me.ws.onclose = () => {
    log({ msg: "连接已关闭", print: _me.opts.print });
    console.groupEnd();
    _me.onclose();

    //  如果手动关闭则跳出，反之重连
    if (_me.stopConnect === true) return;
    console.log("开始重连");
    clearTimeout(_me.connectID);
    _me.connectID = setTimeout(createConnect, _me.opts.reconnectInterval);
  };
}

Foo.prototype.send = function (e) {
  _me.ws.send(e);
};

Foo.prototype.close = function () {
  //  停止重连标识
  console.log("停止重连并关闭");
  _me.stopConnect = true;
  _me.ws.close();
};

// 发送心跳检测
function sendHeartCheck() {
  return new Promise((resolve) => {
    _me.pingID = setTimeout(() => {
      // 发送心跳检测
      _me.ws.send(_me.opts.pingMsg);
      log({
        msg: `===>> ${_me.opts.pingMsg} - 心跳间隔 ${_me.opts.pingTimeout}ms`,
        print: _me.opts.print,
      });
      resolve();
    }, _me.opts.pingTimeout);
  });
}

// 等待响应准备重连
function waitForResponse() {
  _me.pongID = setTimeout(() => {
    // 如果定时器结束仍然未接收到响应, 则认定重连机制
    log({
      msg: `${_me.opts.pongTimeout}ms 未收到响应，等待重连...`,
      print: _me.opts.print,
    });
    _me.ws.close();
  }, _me.opts.pongTimeout);
}

// 心跳检测
function heartCheck() {
  clearTimeout(_me.pingID);
  clearTimeout(_me.pongID);
  // 发送心跳
  sendHeartCheck().then(() => {
    // 发送心跳完毕等待 message响应
    waitForResponse();
  });
}
```
