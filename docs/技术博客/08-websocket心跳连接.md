---
title: websocket 心跳连接
date: 2021-08-09
categories:
  - 技术博客
tags:
  - websocket
---

## websocket心跳机制

```js
// 心跳机制

function log({ msg, preMsg = `websocket：`, style, print = true }) {
  if (print === true) {
    console.log(`%c${preMsg}${msg}`, `${style}`);
  }
}
//  全局保存 this
let _this;

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

function heartbeat({
  url,
  pingTimeout = 4000,
  pongTimeout = 6000,
  reconnectInterval = 3000,
  pingMsg = "Ping!",
  print = true,
}) {
  _this = this;
  _this.opts = {
    url,
    pingTimeout,
    pongTimeout,
    reconnectInterval,
    pingMsg,
    print,
  };

  //  连接次数
  _this.times = 0;

  //  比如实例化后未定义 onopen 方法，_me.onopen 会报错，因此提前全部覆盖一下
  this.onopen = () => {};
  this.onmessage = () => {};
  this.onclose = () => {};
  this.onerror = () => {};

  createConnect();
}

function createConnect() {
  _this.ws = new WebSocket(_this.opts.url);
  _this.times++;
  console.group("websocket");
  log({ msg: "正在连接...", print: _this.opts.print });
  log({ msg: `当前为第 ${_this.times} 次连接`, print: _this.opts.print });
  init();
}

function init() {
  _this.ws.onopen = () => {
    log({ msg: "已经连接", print: _this.opts.print });
    _this.onopen();
    //  建立连接后开始心跳监控
    heartCheck();
  };

  _this.ws.onmessage = (res) => {
    log({ msg: `<<=== Pong`, print: _this.opts.print });
    _this.onmessage(res);
    //  收到信息后开始心跳监控
    heartCheck();
  };

  _this.ws.onerror = () => {
    console.log("连接失败");
    _this.onerror();
  };

  _this.ws.onclose = () => {
    log({ msg: "连接已关闭", print: _this.opts.print });
    console.groupEnd();
    _this.onclose();

    //  如果手动关闭则跳出，反之重连
    if (_this.stopConnect === true) return;
    console.log("开始重连");
    clearTimeout(_this.connectID);
    _this.connectID = setTimeout(createConnect, _this.opts.reconnectInterval);
  };
}

heartbeat.prototype.send = function (e) {
  _this.ws.send(e);
};

heartbeat.prototype.close = function () {
  //  停止重连标识
  console.log("停止重连并关闭");
  _this.stopConnect = true;
  _this.ws.close();
};

// 发送心跳检测
function sendHeartCheck() {
  return new Promise((resolve) => {
    _this.pingID = setTimeout(() => {
      // 发送心跳检测
      _this.ws.send(_this.opts.pingMsg);
      log({
        msg: `===>> ${_this.opts.pingMsg} - 心跳间隔 ${_this.opts.pingTimeout}ms`,
        print: _this.opts.print,
      });
      resolve();
    }, _this.opts.pingTimeout);
  });
}

// 等待响应准备重连
function waitForResponse() {
  _this.pongID = setTimeout(() => {
    // 如果定时器结束仍然未接收到响应, 则认定重连机制
    log({
      msg: `${_this.opts.pongTimeout}ms 未收到响应，等待重连...`,
      print: _this.opts.print,
    });
    _this.ws.close();
  }, _this.opts.pongTimeout);
}

// 心跳检测
function heartCheck() {
  clearTimeout(_this.pingID);
  clearTimeout(_this.pongID);
  // 发送心跳
  sendHeartCheck().then(() => {
    // 发送心跳完毕等待 message响应
    waitForResponse();
  });
}
```
