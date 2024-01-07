# 背景

> `webpack`静态模块化打包工具。无论是前端工程化，还是高级前端岗位都是绕不开的话题之一，面试经常问到构建优化的的方案，自定义`loader`，自定义`plugin`等。无论是进阶，还是面试高级岗位，在这里你都可以找到答案。`webpack`简单来说就是各种令人眼花缭乱的配置，笔者也是感同身受，学了很快就会忘记，所以才有了这篇文章。采用`费曼学习法`，用简洁的思想和简单的语言向大家表达出来，帮助大家也是帮助自己，本文的学习资料大部分来自于官方文档。本文将持续迭代，收藏`===`学会～

## 安装

```shell
# 创建文件夹
mkdir learn-webpack
# 进入文件夹
cd learn-webpack
# 初始化
pnpm init
# 安装依赖
pnpm i webpack webpack-cli -D
```

## 结构划分

代码仓库：https://github.com/GetWebHB/learn-webpack

- 每一个小的章节，都会存放在对应的文件夹中（例：`0.start`），文件夹会存放对应的**配置文件**,**源代码**，**产物**。打包命令如下所示，`b-0`为`build-step0`的简写，方便大家理解

```js
// package.json
  "scripts": {
    "b-0": "webpack --config ./packages/0.start/webpack.config.js"
  },
```

`scripts`脚本，本质上就只在`.bin`文件夹下寻找 webpack, 即`npm run b-1`等同于`npx webpack`，`--config`代表配置文件存在的目录。  
因为每个章节都会有不一样的配置，给它们拆分开这样会更加清晰。如果是公司项目中不需要这样，一般只会有一个配置文件`webpack.config.js`,存放在同`package.json`目录，就不需要指定配置文件路径，执行`npm run build`会自动去根目录查找`webpack.config.js`配置文件

**目录结构**

```
├── README.MD
├── package.json
├── packages
│   └── 0.start
│       ├── build
│       │   └── bundle.js
│       ├── src
│       │   └── main.js
│       └── webpack.config.js
└── pnpm-lock.yaml
```

## 起手式

本节代码见：`0.start`

```js
// main.js
function sayHi() {
  console.log('hi ice 24')
}
sayHi()
export { sayHi }

// webpack.config.js
const { resolve } = require('path')

module.exports = {
  entry: resolve(__dirname, './src/main.js'),
  output: {
    path: resolve(__dirname, 'build'),
    filename: 'bundle.js',
  },
}
```

- 简单走读一下，`cjs`的方式导出了一个对象

1. `entry`代表入口，发现我们使用的是绝对路径，因为默认情况下相对路径为`package.json`存在的目录
2. `output`代表出口，即产物打包后的位置，同样是绝对路径，打包到`build`的文件夹下，文件名为`bundle.js`
3. `npm run b-0`, 即打包产物，就会发现该目录下出现了产物

## mode&devtool

本节代码见：`1.mode_devtool`  
上一小节中，我们学习到了`entry`,`output`这两项配置，这一章节中，我们学习`mode`和`devtool`

### mode

概述：告诉 webpack 使用相应模式的内置优化  
当我们执行`npm run b-0`的时候，`webpack`会有这一串警告，说我们没有设置`mode`
![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eee36533672c4c66aa9554840223f861~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1834&h=654&s=117215&e=png&b=282c34)
那什么是模式（即`mode`）,从提示看说我们可以设置为`development`or`production`  
**传送门**：https://webpack.js.org/configuration/mode/

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f9da85311ab4182bdbb7dc6c66fe054~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1466&h=748&s=148322&e=png&b=fcfcfc)
mode 也是最重要的优化，`webpack`都会帮我们做好。接下来我们来一一了解对应模式展示的不同行为

- `mode` = `'none' | 'development' | 'production'(default)`

```js
// main.js
const mes = 'hi ice 24'
function sayHi() {
  console.log(mes)
}
sayHi()

export { sayHi }
```

#### none

**产物分析**

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13df19b8e0364eca89c28f9069f188f7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1368&h=1264&s=420317&e=png&b=292d35)

- 我们大致扫一眼即可

#### development

我们平常使用的`cli`, `vue/cli`(维护阶段)，`create-react-app`等，反正所有底层使用`webpack`的，`npm run serve / npm run start`这种在本地开启服务的，采用的策略都是使用`development`，主打的就是一个快，不需要通过一些`plugin`，例如`terser`（后面会讲）丑化压缩代码  
**产物分析**
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/564682dee1804992b3dc15ed1fb27d80~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2340&h=1242&s=387998&e=png&b=292d35)
从注释中我们可以得知，它使用`eval`函数可以在浏览器的开发工具中创建一个单独的源文件，在或者说`devtool`:`false`的时候就会移除（`source map`），那么创建一个单独的文件可以干嘛呢？可以映射到代码报错的位置，这也是`devtool`配置项的作用，我们后面会详细探讨。

#### production

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6da8af3c951a42fca16ae03ab7b5ec80~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=912&h=456&s=26353&e=png&b=292d35)
就是那么朴实无华，甚至连`函数`都帮你执行了，直接打印出结果

### devtool

概述：是否生成，控制如何生成 source map(源码映射)，不同的值会明显影响到构建(build)和重新构建(rebuild)的速度。  
**默认值**

- `dev: eval`
- `prod: none`  
  **传送门**：https://webpack.docschina.org/configuration/devtool/

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0bf78e8eb6a14de2b6b5c2df926a3aef~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1484&h=936&s=115197&e=png&b=fbfbfb)
这幅图比较重要，介绍了该配置项的性能怎样，是否使用于`production`中，以及构建的速度如何

- 在`mode`模式为`development`中，我们看见了`eval`函数，可以映射出代码的错误位置信息，即配置为`mode: "eval"`，现在让我们来深入探讨一下`devtool`

就拿`mode:prod`来说，我们发现代码是已经被丑化过，编译后的产物，如果在测试阶段，代码发生了错误压根不知道代码出错在哪里，那我们如何`debug`呢？这正是`source map`的作用，编译后的产物 ->（映射）源代码的位置

#### false

```js
// main.js
const mes = 'hi ice 24'
function sayHi() {
  console.log(mes)
}
console.log(age) // age is not defined
sayHi()

export { sayHi }

// bundle.js
;(() => {
  'use strict'
  console.log(age), console.log('hi ice 24')
})()
```

跑到浏览器上（测试阶段），我们可以看到错误信息，但是却看不到代码详细出错在第几行，这在一个庞大的项目中，是非常致命的（即`devtool: false`）,不开启`source map`

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3fa173da4744f9ba47dfcaccfcbce79~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1150&h=178&s=27161&e=png&b=fef8f8)

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bcf8157212d4b109c87ae4408613815~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=884&h=34&s=12059&e=png&b=fefdfd)

#### eval

使用`eval`函数可以在浏览器的开发工具中创建一个单独的`source map`

#### source-map

当我们配置改为它，我们先看下产物

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eeea7e0b0e9745a98c48778e76bc976d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1584&h=588&s=109640&e=png&b=272b32)
会多出来一个.map 的文件，即源码映射文件，最后一行代表着引用哪个.map 文件，接下来我们在到浏览器下看下行为。

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1d1334a74c42429fa2b22212c10c7c7c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1638&h=322&s=22788&e=png&b=fefafa)
竟然神奇的映射出来了源代码的位置（第几行，甚至第几个字符），非常的神奇是吧

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73fbc31fcfa44dc48ee8ae834a609a4c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=638&h=346&s=34665&e=png&b=fffbfb)
接下来，让我们继续深入探究，简单看下`map`文件

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27b9d0dbcfa44df88d310b7cdd709964~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2112&h=356&s=78981&e=png&b=292d35)

- version：3，从之前 1，2 的版本构建出来的 map 文件有点大，随着不断的迭代构建出来的`.map`文件也越来小
- file：映射的源文件（转换后的源文件）
- mappings：记录位置信息的字符串（VLQ 编码）
- sources：源的路径
- sourcesContent：源代码的内容
- names：转换前的所有变量名和属性名
- sourceRoot：映射目录的位置，为根目录
  ![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/445d5faa0e304a28bf682b5e11003f20~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1026&h=752&s=79779&e=png&b=ffffff)

#### 最佳实践

- prod：`none(默认) | false`
- test：`source-map`
- development: `source-map`