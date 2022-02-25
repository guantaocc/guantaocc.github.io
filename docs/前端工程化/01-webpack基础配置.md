---
title: webpack基础配置和配置文件分离
date: 2021-08-01
categories:
  - 源码
tags:
  - webpack
---

## 关于模块 cjs, umd. esm

- commonjs
  可以在 node 环境下运行
  module.exports 和 require

- umd
  可以在 node 和浏览器同时运行 可以在 node/webpack 环境 require, 也可以在 CDN 中引用

- esm: 一种前端模块化规范

:::tip
cjs 引用时是值的拷贝，esm 为值的引用
:::

## AST(抽象语法树)

关于代码转化: Code-AST-Transform-Code

- extensions:
  查看 ast 转换的网站 [https://astexplorer.net/](https://astexplorer.net/)
  简易 ast 编译 [the-super-tiny-compiler](https://github.com/jamiebuilds/the-super-tiny-compiler)

## webpack-runtime 运行时

webpack-runtime 打包后代码是怎么运行的:

1. 核心modules数组: __webpack__modules根据顺序保存了 模块的导入函数

简单的主模块数组

```js
var __webpack__modules = [ ,(module) => {
  const sum = (a, b) => a + b
  module.exports = sum
} ]
```
2. __webpack__require(module, module.exports, )
  共有三个参数 module对象其中初始化了 exports属性

简化的 require函数
```js

function __webpack__require(moduleID){
  var module = { exports: { }}
  // 实际赋值了 module.exports 属性 为 sum函数
  __webpack_modules__[moduleId](
    module,
    module.exports,
    __webpack_require__
  )
  // 将exports属性返回，也是就 sum函数
  return module.exports
}
```

3. 加载主模块
```js
// 拿到返回的模块内容， 也就是sum函数
var sum  = __webpack__require[1]
// 执行 函数
sum(1, 2)
```

去掉iife后的代码
```js

```



## 样式表(style, sass, less)等

### 加载 loader 原理

css-loader: 通过 postcss 转化语法并转换 ast 并将 url()和 @import 解析成模块
style-loader: 当我们将 css-loader 编译成模块之后需要 在浏览器端生效就需要 style-loader 处理

- 问题: 由于 css-loader 解析之后需要通过 DOMAPI 生成 style 标签加载 css 样式 因此需要样式抽离
- loader的顺序是从后向前加载的，因为通常前一个loader需要后一个loader处理后返回的结果



简单的loader和参数

```js
module.exports = {

}
```

### 样式抽离

使用mini-css-extract-plugin对css文件从模块中抽离并压缩配置

```js
```

### webpack 常用插件使用

### 自定义loader

简单的 loader函数开发

最后的 loader 最早调用，将会传入原始资源内容。
第一个 loader 最后调用，期望值是传出 JavaScript 和 source map（可选）。
中间的 loader 执行时，会传入前一个 loader 传出的结果。

```js
const Webpack = require('webpack')
const path = require('path')

function loaderWebpack(){
  return Webpack({
    entry: './src/index.js',
    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.js/,
          use: [
            {
              loader: path.resolve('./loader.js'),
              options: {
                name: 'test loaderjs'
              }
            }
          ]
        }
      ]
    }
  })
}

loaderWebpack().run((err, result) => {
  console.log(err)
})
```

loader.js

```js
const loaderUtils = require('loader-utils')

module.exports = function(source, sourceMap, data){
  // get options
  const options = loaderUtils.getOptions(this)
  console.log("options", options)
  // 对资源 buffer处理后返回
  return source
}
```

:::tip
3.x 的 loaderUtils API有所变化, 废弃了 getOptions
:::

```js
```

### 样式抽离
切换主题色: [webpack-theme-color-replacer](https://github.com/hzsrc/webpack-theme-color-replacer)

文件管理和压缩: [filemanager-webpack-plugin](https://github.com/gregnb/filemanager-webpack-plugin)

### babel配置

插件和预设的执行顺序：

插件比预设先执行
插件执行顺序是插件数组从前向后执行

```js
module.exports = (api) => {
    return {
        presets: [
            '@babel/preset-react',
            [
                '@babel/preset-env', {
                    useBuiltIns: 'usage',
                    corejs: '2',
                    targets: {
                        chrome: '58',
                        ie: '10'
                    }
                }
            ]
        ],
        plugins: [
            '@babel/plugin-transform-react-jsx',
            '@babel/plugin-proposal-class-properties'
        ]
    };
};
```

### 文件配置 file-loader

```js
import img from './webpack.png';
console.log(img); // 编译后：https://www.test.com/webpack_605dc7bf.png

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          name: '[name]_[hash:8].[ext]',
          publicPath: "https://www.test.com",
        },
      },
    ],
  },
};
```

### url-loader处理大小图片

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              name: '[name]_[hash:8].[ext]',
              // 这里单位为(b) 10240 => 10kb
              // 这里如果小于10kb则转换为base64打包进js文件，如果大于10kb则打包到对应目录
              limit: 10240,
            }
          }
        ]
      }
    ]
  }
}
```

### ts配置

webpack5

```bash
yarn add typescript ts-loader -D
```

webpack4 需安装 ts-loader 8.x

配置文件 tsconfig.json解析

```json
{
  "compilerOptions": {
    /* 基本选项 */
    "target": "es5",                       // 指定 ECMAScript 目标版本: 'ES3' (default), 'ES5', 'ES2015', 'ES2016', 'ES2017', or 'ESNEXT'（"ESNext"表示最新的ES语法，包括还处在stage X阶段）
    "module": "commonjs",                  // 指定使用模块: 'commonjs', 'amd', 'system', 'umd' or 'es2015'
    "lib": [],                             // 指定要包含在编译中的库文件
    "allowJs": true,                       // 允许编译 javascript 文件
    "checkJs": true,                       // 报告 javascript 文件中的错误
    "jsx": "preserve",                     // 指定 jsx 代码的生成: 'preserve', 'react-native', or 'react'
    "declaration": true,                   // 生成相应的 '.d.ts' 文件
    "sourceMap": true,                     // 生成相应的 '.map' 文件
    "outFile": "./",                       // 将输出文件合并为一个文件
    "outDir": "./",                        // 指定输出目录
    "rootDir": "./",                       // 用来控制输出目录结构 --outDir.
    "removeComments": true,                // 删除编译后的所有的注释
    "noEmit": true,                        // 不生成输出文件
    "importHelpers": true,                 // 从 tslib 导入辅助工具函数
    "isolatedModules": true,               // 将每个文件做为单独的模块 （与 'ts.transpileModule' 类似）.

    /* 严格的类型检查选项 */
    "strict": true,                        // 启用所有严格类型检查选项
    "noImplicitAny": true,                 // 在表达式和声明上有隐含的 any类型时报错
    "strictNullChecks": true,              // 启用严格的 null 检查
    "noImplicitThis": true,                // 当 this 表达式值为 any 类型的时候，生成一个错误
    "alwaysStrict": true,                  // 以严格模式检查每个模块，并在每个文件里加入 'use strict'

    /* 额外的检查 */
    "noUnusedLocals": true,                // 有未使用的变量时，抛出错误
    "noUnusedParameters": true,            // 有未使用的参数时，抛出错误
    "noImplicitReturns": true,             // 并不是所有函数里的代码都有返回值时，抛出错误
    "noFallthroughCasesInSwitch": true,    // 报告 switch 语句的 fallthrough 错误。（即，不允许 switch 的 case 语句贯穿）

    /* 模块解析选项 */
    "moduleResolution": "node",            // 选择模块解析策略： 'node' (Node.js) or 'classic' (TypeScript pre-1.6)。默认是classic
    "baseUrl": "./",                       // 用于解析非相对模块名称的基目录
    "paths": {},                           // 模块名到基于 baseUrl 的路径映射的列表
    "rootDirs": [],                        // 根文件夹列表，其组合内容表示项目运行时的结构内容
    "typeRoots": [],                       // 包含类型声明的文件列表
    "types": [],                           // 需要包含的类型声明文件名列表
    "allowSyntheticDefaultImports": true,  // 允许从没有设置默认导出的模块中默认导入。

    /* Source Map Options */
    "sourceRoot": "./",                    // 指定调试器应该找到 TypeScript 文件而不是源文件的位置
    "mapRoot": "./",                       // 指定调试器应该找到映射文件而不是生成文件的位置
    "inlineSourceMap": true,               // 生成单个 soucemaps 文件，而不是将 sourcemaps 生成不同的文件
    "inlineSources": true,                 // 将代码与 sourcemaps 生成到一个文件中，要求同时设置了 --inlineSourceMap 或 --sourceMap 属性

    /* 其他选项 */
    "experimentalDecorators": true,        // 启用装饰器
    "emitDecoratorMetadata": true,         // 为装饰器提供元数据的支持
    "strictFunctionTypes": false           // 禁用函数参数双向协变检查。
  },
  /* 指定编译文件或排除指定编译文件 */
  "include": [
      "src/**/*"
  ],
  "exclude": [
      "node_modules",
      "**/*.spec.ts"
  ],
  "files": [
    "core.ts",
    "sys.ts"
  ],
  // 从另一个配置文件里继承配置
  "extends": "./config/base",
  // 让IDE在保存文件的时候根据tsconfig.json重新生成文件
  "compileOnSave": true // 支持这个特性需要Visual Studio 2015， TypeScript1.8.4以上并且安装atom-typescript插件
}
```

## plugins配置

### html-webpack-plugin

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    news: [path.resolve(__dirname, '../src/news/index.js')],
    video: path.resolve(__dirname, '../src/video/index.js'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'news page',
      // 生成的文件名称 相对于webpackConfig.output.path路径而言
      filename: 'pages/news.html',
      // 生成filename的文件模板
      template: path.resolve(__dirname, '../template/news/index.html'),
      chunks: ['news']

    }),
    new HtmlWebpackPlugin({
      title: 'video page',
      // 生成的文件名称
      filename: 'pages/video.html',
      // 生成filename的文件模板
      template: path.resolve(__dirname, '../template/video/index.html'),
      chunks: ['video']
    }),
  ]
};
```

### copy-webpack-plugin

```js
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: './template/page.html', 
          to: `${__dirname}/output/cp/page.html` 
        },
      ],
    }),
  ],
};
```

### 定义编译时变量 DefinePlugin

```js
// webpack.config.js
const isProd = process.env.NODE_ENV === 'production';
module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      PAGE_URL: JSON.stringify(isProd
        ? 'https://www.tencent.com/page'
        : 'http://testsite.tencent.com/page'
      )
    }),
  ]
}

// 代码里面直接使用
console.log(PAGE_URL);
```

### 分析模块大小

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}
```

### 代码分割 splitChunks

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  optimization: {
    splitChunks: {
      // 分隔符
      // automaticNameDelimiter: '~',
      // all, async, and initial
      chunks: 'all',
      // 它可以继承/覆盖上面 splitChunks 中所有的参数值，除此之外还额外提供了三个配置，分别为：test, priority 和 reuseExistingChunk
      cacheGroups: {
        vendors: {
          // 表示要过滤 modules，默认为所有的 modules，可匹配模块路径或 chunk 名字，当匹配的是 chunk 名字的时候，其里面的所有 modules 都会选中
          test: /[\\/]node_modules\/antd\//,
          // priority：表示抽取权重，数字越大表示优先级越高。因为一个 module 可能会满足多个 cacheGroups 的条件，那么抽取到哪个就由权重最高的说了算；
          // priority: 3,
          // reuseExistingChunk：表示是否使用已有的 chunk，如果为 true 则表示如果当前的 chunk 包含的模块已经被抽取出去了，那么将不会重新生成新的。
          reuseExistingChunk: true,
          name: 'antd'
        }
      }
    }
  },
}
```

### 扩展

- [webpack 所有配置说明](https://webpack.docschina.org/configuration/)
