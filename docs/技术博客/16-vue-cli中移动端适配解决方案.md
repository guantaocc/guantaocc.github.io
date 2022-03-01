---
title: vue-cli中移动端适配解决方案(rem,vw)
date: 2022-01-21
categories:
  - 技术博客
tags:
  - 移动端
---

## 适配之前的工作

通常移动端需要调试和辅助工具以及相关组件库
vconsole: 调试控制台
vant: 移动端组件库
fastclick: 点击延迟解决方案
ua-device: 移动端机型识别的库

```bash
yarn add vconsole fastclick ua-device
# 如果为 vue3安装 3.x版本即可
yarn add vant@latest-v2
```

## rem移动端适配

rem布局主要依赖 html元素中 font-size的大小
如果设计稿宽度为 375px 将 font-size设为37.5px, 那么 10rem = 375px = 100%宽度
这里采用 amfe-flexible postcss-pxtorem来进行自动转换

- 安装

```bash
yarn add amfe-flexible -D
# vue-cli中postcss版本不为 8.x, 而postcss-pxtorem最新版本需求 8.x
yarn add postcss-pxtorem@5.1.1 -D
```

- 配置postcss转换的库进行转换

postcss.config.js

```js
module.exports = {
  plugins: {
    "postcss-pxtorem": {
      // 37.5表示设计稿宽度为 375px时, rem为10rem
      rootValue: 37.5,
      propList: ["*", "!border"],
      exclude: /node_modules/i 
    },
  },
};
```
- main.js引入

```js
import Vue from "vue";
import App from "./App.vue";

/**
 * rem flexible
 */

import "amfe-flexible";

/**
 * vant ui
 */
import { Toast, Dialog } from "vant";
import FastClick from "fastclick";
FastClick.attach(document.body);
import Vconsole from "vconsole";

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line no-unused-vars
  const vConsole = new Vconsole({
    defaultPlugin: ["system", "network", "element"],
    maxLogNumber: "1024",
    onReady: () => console.log("vconsole is ready"),
  });
}

Vue.config.productionTip = false;

Vue.use(Toast);
Vue.use(Dialog);

new Vue({
  render: (h) => h(App),
}).$mount("#app");

```

## viewport vw移动端适配

视口适配根据 vw比例进行适配 100vw为屏幕宽度的 100%

- viewport视口配置

```html
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no">
```

- 配置Postcss

```js
module.exports = {
  plugins: {
    "postcss-px-to-viewport": {
      unitToConvert: "px", // 要转化的单位
      viewportWidth: 375, // UI设计稿的宽度
      unitPrecision: 6, // 转换后的精度，即小数点位数
      propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
      viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
      fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw      selectorBlackList: ["wrap"], // 指定不转换为视窗单位的类名，
      minPixelValue: 1, // 默认值1，小于或等于1px则不进行转换
      mediaQuery: true, // 是否在媒体查询的css代码中也进行转换，默认false
      replace: true, // 是否转换后直接更换属性值
      exclude: [/node_modules/], // 设置忽略文件，用正则做目录名匹配
    },
  },
};

```

- 解决三方库兼容vant的问题:
通常情况下如果设计稿宽度为 375px时正常，因为vant默认设计稿宽度为375px, 如果设计稿宽度改变，那么vant组件样式可能会出现变形
因此我们需要对三方插件或者组件库做一些兼容处理

```js
const path = require("path");

module.exports = ({ webpack }) => {
  // 根据webpack读取的资源路径设置 标准值
  const viewWidth = webpack.resourcePath.includes(
    path.join("node_modules", "vant")
  ) ? 375 : 750;
  return {
    plugins: {
      autoprefixer: {},
      "postcss-px-to-viewport": {
        unitToConvert: "px",
        viewportWidth: viewWidth,
        unitPrecision: 6,
        propList: ["*"],
        viewportUnit: "vw",
        fontViewportUnit: "vw",
        selectorBlackList: [],
        minPixelValue: 1,
        mediaQuery: true,
        exclude: [],
        landscape: false,
      },
    },
  };
};

```

- 总结:

[两种方式移动端模板](https://github.com/guantaocc/vue-cli-mobile)