---
title: vue中jsx的使用方法总结
date: 2022-02-26
categories:
  - 技术博客
tags:
  - 组件
---

简单介绍一下vue中jsx的一些使用方法以及总结一下vue中 template模板和 jsx中使用方式的不同

<!-- more -->

## jsx作用

jsx使用 js的模式编写，因此jsx更具有比 vue模板中更高的灵活性和扩展性

例如 ant-design-vue组件库中大量使用了 jsx来支持外部更灵活的配置

## 使用jsx代替 h函数

我们知道h函数返回 vue中的 vNode 函数,但是根据官网的实例，h函数嵌套结构书写非常的繁琐以及缺乏语义

在vue-cli@3.x中已经 集成了 jsx语法的书写

如果在webpack项目中，可以借助babel工具

```bash
# 安装
npm install @vue/babel-preset-jsx @vue/babel-helper-vue-jsx-merge-props
```

babel.config.js

```js
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset',
    ['@vue/babel-preset-jsx',
      {
        'injectH': false
      }]
  ]
}
```


## jsx中组件和标签属性写法总结

jsx语法的使用需要在 render函数中进行并返回 vnode

### 普通模板式写法

```js
render(){
  return <div>
    {/* 动态内容 */}
    <p>hello { this.msg }</p>

  </div>
}
```

### 传递props

1. 传递props

```js
render(){
  return <input type="email" placeholder={this.placeholderText} />
}
```

2. 展开运算符展开对象传入子组件

可传递所有 props(on, style, class, attrs)

```js
render(){
  return <MyComponent {...this.defaultProps}></MyComponent>
}
```

传递所有 attrs

```js
const attrs = {
  name: 'zhangsan',
  age: 18
}
render(){
  return <MyComponent {...{ attrs: attrs }}></MyComponent>
}
```

### 传递事件

1. 与 template中不同，在jsx中处理事件需要 加上 on + 事件名称的大驼峰写法来监听

```js
render(){
  return <MyComponent onChange={this.handleChange}></MyComponent>
},
methods(){
  handleChange(){

  }
}
```

2. 监听原生事件, 也就是h函数参数对象 的 nativeOn属性

```js
render() {
  // 监听下拉框根元素的click事件
  return <MyComponent nativeOnClick={this.handleClick}></MyComponent>
}
```

3. on绑定组件事件 和 事件修饰符，阻止冒泡在jsx中使用

- .stop: 阻止事件冒泡，在JSX中使用event.stopPropagation()来代替
- .prevent: 阻止默认行为，在JSX中使用event.preventDefault() 来代替
- .self: 手动判断 e.target 和 e.currentTarget

提供一些事件修饰的简单语法

```js
render() {
  return (
    <div
      on={{
        // 相当于 :click.capture
        '!click': this.$_handleClick,
        // 相当于 :input.once
        '~input': this.$_handleInput,
        // 相当于 :mousedown.passive
        '&mousedown': this.$_handleMouseDown,
        // 相当于 :mouseup.capture.once
        '~!mouseup': this.$_handleMouseUp
      }}
    ></div>
  )
}
```

4. 获取事件对象

获取到的事件对象都为原生的事件对象

```js
methods: {
  handleClick(e){
    console.log(e)
  }
}

```

### 指令在jsx中的写法

1. v-if 和 v-for

v-if可以用条件判断或者三元表达式

```js
render(){
  const isImportant= false
  return isImportant ? <span>重要<span> : <span>不重要<span>
}
```

v-for可以采用 react中 直接map返回模板的方式渲染列表, 注意要绑定 key

```js
  render(h){
    const list = [
      {name: 'zhangsan', age: 12},
      {name: 'lisi', age: 18}
    ]
    return (
      <ul>
        { list.map(item => {
          return <li key={item.name}>
            <span>姓名: {item.name}</span>
            <span>年龄: {item.age}</span>
          </li>
        })}
      </ul>
    )
  }
```

3. v-model的 hack处理

```js
render() {
  // 监听下拉框根元素的click事件
  return <input value={this.value} onInput={this.handleValue}></input>
}
```

4. v-html和 v-text

我们 domProps参数定义 innerHTML属性, jsx中单独定义了属性定义
innerHTML

v-text

```js
render(h){
  return <div domPropsInnerText={this.content}></div>
}
```

v-html

```js
render() {
  // v-html 指令在JSX的写法是 domPropsInnerHTML
  return <div domPropsInnerHTML={this.content}></div>
}
```

5. v-show的简单写法

```js
render(){
  return <div vShow={false}>需要隐藏的div</div>
}
```

6. v-model的写法
```js
render(){
  return (
    <a-form-model vModel={this.keys}></a-form-model>
  )
}
```

### 插槽和默认插槽在 jsx中写法

插槽就是子组件中提供给父组件使用的一个占位符，插槽分为默认插槽，具名插槽和作用域插槽
对应 h函数中的 slot 和 scopedSlots

官网中 h函数的 插槽定义, 由此我们可以知道作用域插槽为一个对象，默认插槽为 default属性并且返回一个 vNode

```
scopedSlots: {
  default: props => createElement('span', props.text)
},
```

1. 默认插槽

在 vue中 $slots定义了当前组件的所有插槽属性

```js
// 父组件传递
render(){
  return (
    <>
      <MyComponent>
        <span>this is my slot default</span>
      </MyComponents>
    </>
  )
}
// 子组件接收
render(){
  return <div>{this.$slots.default}</div>
}
```

2. 具名插槽

```js
// 父组件传递
render(){
  return (
    <MyComponent>
      <span slot="footer">this is slot footer</span>
    </MyComponent>
  )
}
// 子组件接收
render(){
  // 使用具名插槽名称进行渲染
  return <div>{this.$slots.footer}</div>
}
```

3. 作用域插槽

在JSX中，因为没有v-slot指令，所以作用域插槽的使用方式就与模板代码里面的方式有所不同, 需要使用到 scopedSlots属性

例如自定义 element-ui中 table列的 作用域插槽

```js
{/* jsx element template */}
<ElTable data={this.data}>
  <ElTableColumn label="姓名" 
  scopedSlots={{
     header: ({ row }) => { return <span>姓名</span>}, 
     default: ({row}) => { return <div style="color: red">{row.name}</div>}
  }}>
  </ElTableColumn>
</ElTable>

// 子组件接受
render(){
  return (
    <div>
      <span>{{this.$scopedSlots.header({ name: '张三' })}}</span>
    </div>
  )
}
```

### 函数式组件中的用法

函数式组件没有自己的 this, 所有属性直接从 context 属性中获取

```js
render(h, context){
  const { props } = context
  if(props.avatar){
    return <img src={props.avatar} />
  }
  return <img src="default.png" />
}
```

### 获取 ref

使用 $refs + ref名称 获取即可

```js
render(){
  return <MyComponent ref="refCom" />
}
```

### 描述动态组件

通常使用动态组件时 <component is="curComponent"><component>

1. 使用 if / else判断

```js
render(){
  const current = 'com1'
  const currentComponent = (is) => {
    if(is === 'com1'){
      return <com1></com1>
    }else{
      return <com2></com2>
    }
  }
  return <div>{currentComponent(current)}</div>
}
```

2. 使用h函数

render函数的参数 h函数可以渲染组件为vnode

```js
import com1 from './com1'
import com2 from './com2'

render(h){
  // 相当于 is
  const isCurrent = 'com1'
  return <div>{ h(isCurrent) }</div>
}
```


## 附：官网上对 render函数中参数

```js
{
  // 与 `v-bind:class` 的 API 相同，
  // 接受一个字符串、对象或字符串和对象组成的数组
  'class': {
    foo: true,
    bar: false
  },
  // 与 `v-bind:style` 的 API 相同，
  // 接受一个字符串、对象，或对象组成的数组
  style: {
    color: 'red',
    fontSize: '14px'
  },
  // 普通的 HTML attribute
  attrs: {
    id: 'foo'
  },
  // 组件 prop
  props: {
    myProp: 'bar'
  },
  // DOM property
  domProps: {
    innerHTML: 'baz'
  },
  // 事件监听器在 `on` 内，
  // 但不再支持如 `v-on:keyup.enter` 这样的修饰器。
  // 需要在处理函数中手动检查 keyCode。
  on: {
    click: this.clickHandler
  },
  // 仅用于组件，用于监听原生事件，而不是组件内部使用
  // `vm.$emit` 触发的事件。
  nativeOn: {
    click: this.nativeClickHandler
  },
  // 自定义指令。注意，你无法对 `binding` 中的 `oldValue`
  // 赋值，因为 Vue 已经自动为你进行了同步。
  directives: [
    {
      name: 'my-custom-directive',
      value: '2',
      expression: '1 + 1',
      arg: 'foo',
      modifiers: {
        bar: true
      }
    }
  ],
  // 作用域插槽的格式为
  // { name: props => VNode | Array<VNode> }
  scopedSlots: {
    default: props => createElement('span', props.text)
  },
  // 如果组件是其它组件的子组件，需为插槽指定名称
  slot: 'name-of-slot',
  // 其它特殊顶层 property
  key: 'myKey',
  ref: 'myRef',
  // 如果你在渲染函数中给多个元素都应用了相同的 ref 名，
  // 那么 `$refs.myRef` 会变成一个数组。
  refInFor: true
}
```