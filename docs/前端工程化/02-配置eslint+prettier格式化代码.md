---
title: 配置eslint+prettier格式化代码
date: 2021-01-28
categories:
  - 前端工程化
tags:
  - eslint
  - prettier
---

在vue, react中使用 prettier + eslint配合 vscode编辑器自动格式化代码

<!-- more -->

## 在 create-react-app 配置

### 安装插件

1. 安装 vscode 中 eslint 和 prettier 插件
2. 安装 prettier 和 eslint

```bash
npm install eslint-config-prettier --save-dev
npm install eslint-plugin-prettier --save-dev
# 锁定版本号
npm install prettier --save-dev --exact
```

### 配置 eslint

根目录下新建 eslintrc.js

```js
module.exports = {
  extends: [
    "react-app", //  react帮配置好了一些语法，譬如箭头函数
    "plugin:prettier/recommended", // prettier配置
  ],
  rules: {
    "react/destructuring-assignment": "off",
    "react/jsx-one-expression-per-line": "off", // 关闭要求一个表达式必须换行的要求，和Prettier冲突了
    "react/jsx-wrap-multilines": "off",
  },
  // 覆盖
  overrides: [],
};
```

### 配置 prettier

根目录下新建 .prettierrc.js

```js
module.exports = {
  printWidth: 80, //一行的字符数，如果超过会进行换行，默认为80
  tabWidth: 2, //一个tab代表几个空格
  useTabs: false, //是否使用tab进行换行
  singleQuote: true, //字符串是否使用单引号
  semi: false,
  trailingComma: "none",
  bracketSpacing: true, //对象大括号
  parser: "babel", //代码的解析引擎
};
```

## vue-cli 创建项目的相关配置

### 配置 typescript

vscode 中对 ts 的 eslint 校验

settings.json

```
"eslint.validate": "[typescript]"
```

### .eslintrc.js 中增加对 vue 的校验规则

.eslintrc.js

```js
module.exports = {
  extends: [
    "plugin:vue/recommended", // vue语法 lint
  ],
  parserOptions: {
    ecmaVersion: 2020,
    parser: "babel-eslint", // 解决对jsx闭合标签的lint错误
  },
};
```
