## 前端监控插件 sdk-web-monitor

`sdk-web-monitor` 是通过`TypeScript`编写和`Rollup`工具打包来实现的一个前端监控SDK插件——使用方便、易扩展，目前已实现页面性能监控、异常监控、Http网络请求监控、用户行为监控的数据采集与上报至监控后台等基本功能。

## ✨功能介绍

##### 1.页面性能监控

页面性能监控主要是采集网站前端页面性能数据，并进行上报。如FP、FCP、DOMReady、DNS等页面性能数据。

-   `DNS`、`DomReady`、`Load` 性能参数根据 `Navigation timing` 获取。`window.performance.getEntriesByType("navigation")`，`Navigation timing`时间精度可以达毫秒的小数点好几位，精度比`performance.timing`高，但兼容性差。

-   FP 和 FCP 通过`new PerformanceObserver`(性能监视器)方法获取。`entryTypes`(入口类型)为 paint 的元素渲染。

##### 2.异常监控

异常监控主要是采集网站的异常情况数据，并进行上报。如JS异常数据、资源加载异常数据、Promise异常数据、Console异常数据。

-   JS异常： 通过`window.onerror`采集JS的异常数据并上报
-   资源加载异常：通过`window.addEventListener`监听`error`事件，`window.onerror`和`addEventlistener('error', handler, true)`都会监控到JS异常，所以资源异常监控要判断是否存在src/image属性过滤
-   Promise异常：监听`unhandledrejection`事件
-   Console异常：对`console.error`重写，保存原方法并通过call调用
-   异常错误的上报用`Set`去重

##### 3.Http网络请求监控

Http网络请求监控主要是采集网站的所有网络请求数据（包括xhr和fetch两种请求方式），并进行上报。如Http成功请求的响应时间、Http失败请求的数据等，以及可以设置监控请求的url过滤。

-   Http请求异常：对xhr的`open`和`send`方法，`window.fetch`方法进行重写，实现了请求url过滤（用户可自定义过滤url），在过滤列表内的url地址不会对其监听，以及手动`new Error().stack`抛出错误堆栈。

-   劫持是怎么实现的？ 劫持send方法，通过`this.addEventlistener`监听xhr实例的`readystatechange`事件，在事件监听的回调中判断状态码并对数据处理（比如发送的延时、持续时间、状态码、请求的类型、响应内容）并上报。

##### 4.用户行为监控

用户行为监控主要是采集网站用户行为数据，并进行上报。如路由切换数据，并以此为基础可以计算出PV、UV、浏览器使用占比统计、页面访问情况统计等。

-   PV：用户每次进入页面时上报即可，需要注意`SPA单页面`应用要结合路由跳转

-   UV：服务端根据`cookie`判断PV的第一次上报即为一次UV

##### 5.数据上报

原理：将以上监控数据带上时间缓存在`队列`里，分批发送给后端，因为一个个发送太耗费通信资源。同时，为了不影响页面性能，将发送数据这个动作放在`requestIdleCallback`函数里，这个函数是趁着页面刷新间隙执行的，这段时间浏览器是空闲的。

-   数据上报采用`requestIdleCallback`（帧的空闲发送）和`Navigator.sendBeacon`

-   负责维护一个缓存`队列`，按照一定的队列长度和缓存时间间隔来聚合上报数据，会开放一些方法自定义缓存队列长度和缓存间隔时间

-   用户自定义配置项：用户可自定义缓存队列长度、缓存间隔时间、请求过滤url地址

[官方文档](https://github.com/bertilchan/Monitor-SDK)

## 快速上手

##### 1.安装项目依赖

```bash
npm i sdk-web-monitor -S # 或者 yarn add sdk-web-monitor
```

##### 2.导入

```js
import { initMonitor } from 'sdk-web-monitor'
```

##### 3.初始化

用户可以自定义配置：

以下都为可选值

- 上报给监控后台的url 
- 请求池大小
- 请求时间间隔
- 请求过滤url

```js
initMonitor({//初始化
        setsetEmitUrl: 'http://localhost:3000/', //发送给监控后台的url地址
        setEmitLen: 5 ,  //请求池的大小
        setEmitTime: 5000 , //请求时间间隔/ms
        setUrlIgnoreList: ['apifox.com'] //请求过滤url，即发送给apifox.com的请求不会对其监控
})
```