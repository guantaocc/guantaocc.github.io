---
title: vue-cli源码
date: 2021-11-01
categories:
  - 前端工程化
tags: 
  - webpack
  - 脚手架
---

简单阅读一下 vue-cli的一些源代码，学习一下vue-cli命令实现的代码逻辑

<!-- more -->

## vue-cli目录

vue-cli通过lerna包管理工具进行npm包和插件包的管理

packages/@vue

```bash
babel-preset-app:
cli: 包入口文件(vue 命令)
```

lerna.json
```json
  "packages": [
    "packages/@vue/babel-preset-app",
    "packages/@vue/cli*",
    "packages/vue-cli-version-marker"
  ],
```

## 从入口开始处理命令行参数

packages/@vue/cli/bin/vue.js

举出部分核心逻辑和包的作用:
```js
// chalk, semver是为了增强控制台展示效果(颜色，长度等)
// 这里的工具类做了一些功能上的增强
const { chalk, semver } = require('@vue/cli-shared-utils') 
// 获取需要的node版本号
const requiredVersion = require('../package.json').engines.node
// 检查node版本号
function checkNodeVersion (wanted, id) {
  if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
    console.log(chalk.red(
      'You are using Node ' + process.version + ', but this version of ' + id +
      ' requires Node ' + wanted + '.\nPlease upgrade your Node version.'
    ))
    process.exit(1)
  }
}
checkNodeVersion(requiredVersion, '@vue/cli')

// fs: 文件操作库, path: 路径 slash:处理linux和windows系统对于文件分割符的作用

const fs = require('fs')
const path = require('path')
const slash = require('slash')
const minimist = require('minimist')

// program核心包，用于处理命令行参数
const program = require('commander')

// lib目录下 command辅助方法
const loadCommand = require('../lib/util/loadCommand')

// 注册命令
// 1. 分为当前包(本地修改配置类命令)命令注册
// 2. 分包的命令注册
program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>', 'set option value')
  .option('-d, --delete <path>', 'delete option from config')
  .option('-e, --edit', 'open config with default editor')
  .option('--json', 'outputs JSON result only')
  .action((value, options) => {
    require('../lib/config')(value, options)
  })

...

program
  .command('init <template> <app-name>')
  .description('generate a project from a remote template (legacy API, requires @vue/cli-init)')
  .option('-c, --clone', 'Use git clone when fetching remote template')
  .option('--offline', 'Use cached template')
  .action(() => {
    // 比如Init命令则是加载NPM包
    loadCommand('init', '@vue/cli-init')
  })

```

loadCommand.js

```js
// 主要作用是根据命令名称查找响应的模块处理逻辑
module.exports = function loadCommand (commandName, moduleName) {
  const isNotFoundError = err => {
    return err.message.match(/Cannot find module/)
  }
  try {
    return require(moduleName)
  } catch (err) {
    if (isNotFoundError(err)) {
      try {
        return require('import-global')(moduleName)
      } catch (err2) {
        if (isNotFoundError(err2)) {
          const installCommand = getGlobalInstallCommand()
          console.log()
          console.log(
            `  Command ${chalk.cyan(`vue ${commandName}`)} requires a global addon to be installed.\n` +
            `  Please run ${chalk.cyan(`${installCommand} ${moduleName}`)} and try again.`
          )
          console.log()
          process.exit(1)
        } else {
          throw err2
        }
      }
    } else {
      throw err
    }
  }
}
```
  到这里就全局注册了vue中的命令行命令

## vue create命令

vue create命令是怎么生成一个vue的模板并集成webpack的配置的?

先找到 create命令 的注册位置

packages/@vue/cli/bin/vue.js
```js
program
  .version(`@vue/cli ${require('../package').version}`)
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('create a new project powered by vue-cli-service')
  .option('-p, --preset <presetName>', 'Skip prompts and use saved or remote preset')
  
  // 众多子命令，链式操作每次都会返回 Program类的实例
  .action((name, options) => {
    // 这里判断至少需要一个子命令
    // vue create -p ...
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    // --git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    // create.js中处理相应逻辑
    // name为命令名: create
    // options: 解析出来的命令行参数
    require('../lib/create')(name, options)
  })
```

packages/@vue/cli/lib/create.js

```js
async function create (projectName, options) {
  // ... 
  // 判断项目名称规范
  // 判断当前目录下是否重复等
  const name = inCurrent ? path.relative('../', cwd) : projectName
  const result = validateProjectName(name)

  // 初始化了 Creator类， 返回了Promise对象
  // getPromptModules为我们选择的选项 返回一个数组
  const creator = new Creator(name, targetDir, getPromptModules())
  await creator.create(options)
}
```

packages/@vue/cli/lib/createTools.js

```js
exports.getPromptModules = () => {
  return [
    'vueVersion',
    'babel',
    'typescript',
    'pwa',
    'router',
    'vuex',
    'cssPreprocessors',
    'linter',
    'unit',
    'e2e'
  ].map(file => require(`../promptModules/${file}`))
}
```

创建项目的核心类，包含对选项选择等处理逻辑
packages/@vue/cli/lib/Creator.js

```js
// ...
// 事件处理相关
const EventEmitter = require('events')
const Generator = require('./Generator')
// ... 大量在包中处理的工具类
// 比如 writeFileTree可以递归创建目录
const writeFileTree = require('./util/writeFileTree')


// 继承了EventEmitter:
// 当前类为一个事件触发和接收的中心
// 可以 emit事件 和 on事件

module.exports = class Creator extends EventEmitter {
  constructor (name, context, promptModules) {
    // name: ProjectName => 创建的项目名称
    // context: 目标目录
    // promptModules: 引入的处理每个选项的处理逻辑函数
    const promptAPI = new PromptModuleAPI(this)
    // 依次执行选项配置的逻辑
    promptModules.forEach(m => m(promptAPI))
  }

  // @param: 命令行输入的选项
  // @preset: 保存的预设

  async create (cliOptions = {}, preset = null) {
     if (!preset) {
      // 如果又预设会解析这些预设并弹出
      if (cliOptions.preset) {
        // vue create foo --preset bar
        preset = await this.resolvePreset(cliOptions.preset, cliOptions.clone)
      } else if (cliOptions.default) {
        // vue create foo --default
        preset = defaults.presets.default
      } else if (cliOptions.inlinePreset) {
        // vue create foo --inlinePreset {...}
        try {
          preset = JSON.parse(cliOptions.inlinePreset)
        } catch (e) {
          error(`CLI inline preset is not valid JSON: ${cliOptions.inlinePreset}`)
          exit(1)
        }
      } else {
        // 如果没有预设会初始化选项并 要求选择
        preset = await this.promptAndResolvePreset()
      }
    }

    // 这里已经是需要选择的选项 选择完毕并保存到 preset中

    // clone before mutating: 深拷贝预设选项
    preset = cloneDeep(preset)

    // inject core service: 
    // vue-cli service命令逻辑，集成webpack配置
    // 本地.env文件
    // 合并 vue.config.js配置
    preset.plugins['@vue/cli-service'] = Object.assign({
      projectName: name
    }, preset)


    // legacy support for router:
    //  如果选择router则集成router
    if (preset.router) {
      preset.plugins['@vue/cli-plugin-router'] = {}
      // 如果选择了路由模式
      if (preset.routerHistoryMode) {
        preset.plugins['@vue/cli-plugin-router'].historyMode = true
      }
    }

    // legacy support for vuex: vuex集成
    if (preset.vuex) {
      preset.plugins['@vue/cli-plugin-vuex'] = {}
    }
       const packageManager = (
      cliOptions.packageManager ||
      loadOptions().packageManager ||
      (hasYarn() ? 'yarn' : null) ||
      (hasPnpm3OrLater() ? 'pnpm' : 'npm')
    )
    
    // 清空console并开始生成package.json文件
    await clearConsole()
    const pm = new PackageManager({ context, forcePackageManager: packageManager })

    log(`✨  Creating project in ${chalk.yellow(context)}.`)
    this.emit('creation', { event: 'creating' })

    // get latest CLI plugin version
    const { latestMinor } = await getVersions()

    // generate package.json with plugin dependencies
    const pkg = {
      name,
      version: '0.1.0',
      private: true,
      devDependencies: {},
      ...resolvePkg(context)
    }
    
    // 遍历预设插件依赖生成 devDependencies
    const deps = Object.keys(preset.plugins)
    deps.forEach(dep => {
      if (preset.plugins[dep]._isPreset) {
        return
      }

      let { version } = preset.plugins[dep]

      if (!version) {
        if (isOfficialPlugin(dep) || dep === '@vue/cli-service' || dep === '@vue/babel-preset-env') {
          version = isTestOrDebug ? `latest` : `~${latestMinor}`
        } else {
          version = 'latest'
        }
      }

      pkg.devDependencies[dep] = version
    })

    // 生成 package.json文件
    await writeFileTree(context, {
      'package.json': JSON.stringify(pkg, null, 2)
    })

    // 生成.npmrc文件
    // ...
    // 执行 git init命令
    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {
      log(`🗃  Initializing git repository...`)
      this.emit('creation', { event: 'git-init' })
      await run('git init')
    }

    // install plugins: 安装插件的提示信息
    log(`⚙\u{fe0f}  Installing CLI plugins. This might take a while...`)
    log()
    this.emit('creation', { event: 'plugins-install' })

    // run generator: 核心，生成模板文件和生成对应的配置文件

    log(`🚀  Invoking generators...`)
    this.emit('creation', { event: 'invoking-generators' })
    // plugins对象转换数组
    const plugins = await this.resolvePlugins(preset.plugins, pkg)
    // 主要生成 babel.config.js 等配置文件和注册生成文件的钩子函数
    // 以及根据 是否单独生成配置的选项选择生成默认文件 和 放入 package.json中
    const generator = new Generator(context, {
      pkg,
      plugins,
      afterInvokeCbs,
      afterAnyInvokeCbs
    })
    await generator.generate({
      extractConfigFiles: preset.useConfigFiles
    })

    // install additional deps (injected by generators)
    log(`📦  Installing additional dependencies...`)
    this.emit('creation', { event: 'deps-install' })
    log()

    if (!isTestOrDebug || process.env.VUE_CLI_TEST_DO_INSTALL_PLUGIN) {
      // 执行 npm install 命令 安装依赖
      await pm.install()
    }
    // 执行生成配置文件的钩子函数
    for (const cb of afterInvokeCbs) {
      await cb()
    }
    for (const cb of afterAnyInvokeCbs) {
      await cb()
    }

    // 生成 README.md
    if (!generator.files['README.md']) {
      // generate README.md
      log()
      log('📄  Generating README.md...')
      await writeFileTree(context, {
        'README.md': generateReadme(generator.pkg, packageManager)
      })
    }

    // 执行完毕
    log()
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
    if (!cliOptions.skipGetStarted) {
      log(
        `👉  Get started with the following commands:\n\n` +
        (this.context === process.cwd() ? `` : chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`)) +
        chalk.cyan(` ${chalk.gray('$')} ${packageManager === 'yarn' ? 'yarn serve' : packageManager === 'pnpm' ? 'pnpm run serve' : 'npm run serve'}`)
      )
    }
    log()
    this.emit('creation', { event: 'done' })
  }
}
```

这里是生成一些预设文件内容的

packages/@vue/cli/lib/Generator.js
```js
const defaultConfigTransforms = {
  babel: new ConfigTransform({
    file: {
      js: ['babel.config.js']
    }
  }),
  postcss: new ConfigTransform({
    file: {
      js: ['postcss.config.js'],
      json: ['.postcssrc.json', '.postcssrc'],
      yaml: ['.postcssrc.yaml', '.postcssrc.yml']
    }
  }),
  eslintConfig: new ConfigTransform({
    file: {
      js: ['.eslintrc.js'],
      json: ['.eslintrc', '.eslintrc.json'],
      yaml: ['.eslintrc.yaml', '.eslintrc.yml']
    }
  }),
  jest: new ConfigTransform({
    file: {
      js: ['jest.config.js']
    }
  }),
  browserslist: new ConfigTransform({
    file: {
      lines: ['.browserslistrc']
    }
  }),
  'lint-staged': new ConfigTransform({
    file: {
      js: ['lint-staged.config.js'],
      json: ['.lintstagedrc', '.lintstagedrc.json'],
      yaml: ['.lintstagedrc.yaml', '.lintstagedrc.yml']
    }
  })
}
```

## 创建项目的模板文件是怎么生成的

  模板文件生成和插件管理的逻辑集成在 Generator (packages/@vue/cli/lib/Generator.js)类中, 其中解析了并引入遍历 plugins

  引入插件的代码都为一个函数，在Generator中执行了引入的


packages/@vue/cli-plugin-router/index.js
```js
// @param api: 为Gererator函数实例上下文
module.exports = (api, options = {}, rootOptions = {}) => {
  // ...
  api.injectImports(api.entryFile, `import router from './router'`)

  // ... 等类方法调用
}
```
packages/@vue/cli-plugin-router/template/App.vue

```js
// template放置了模板文件, 并注入了变量
---
extend: '@vue/cli-service/generator/template/src/App.vue'
replace:
  - !!js/regexp /<template>[^]*?<\/template>/
  - !!js/regexp /\n<script>[^]*?<\/script>\n/
  - !!js/regexp /  margin-top[^]*?<\/style>/
---

<%# REPLACE %>
<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
    <router-view/>
  </div>
</template>
<%# END_REPLACE %>

<%# REPLACE %>
<%# END_REPLACE %>

<%# REPLACE %>
}

<%_ if (rootOptions.cssPreprocessor !== 'stylus') { _%>
  <%_ if (!rootOptions.cssPreprocessor) { _%>
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
  <%_ } else { _%>
nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
  <%_ } _%>
<%_ } else { _%>
nav
  padding 30px
  a
    font-weight bold
    color #2c3e50
    &.router-link-exact-active
      color #42b983
<%_ } _%>
</style>
<%# END_REPLACE %>

```

## 值得学习的一些思想和工作方法的封装



