/**
 * todo: 这里面的每一个函数都应该只调用一次，应该考虑封装成context或为数据设置一个缓存
 *
 */
// todo:无法获得真实使用的浏览器
var getBrowserInfo = function () {
    var ua = navigator.userAgent;
    var tem;
    var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
        if (tem != null)
            return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null)
        M.splice(1, 1, tem[1]);
    return M.join(' ');
};
var getPlatform = function () {
    //@ts-ignore
    var userAgentData = window.navigator.userAgentData;
    var userAgent = window.navigator.userAgent, 
    // @ts-ignore
    platform = (userAgentData === null || userAgentData === void 0 ? void 0 : userAgentData.platform) || window.navigator.platform, macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'macOS'], windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'], iosPlatforms = ['iPhone', 'iPad', 'iPod'], os = "";
    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    }
    else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    }
    else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    }
    else if (/Android/.test(userAgent)) {
        os = 'Android';
    }
    else if (/Linux/.test(platform)) {
        os = 'Linux';
    }
    return os;
};
// const IPIFY_ENDPOINT_IPV6 = 'https://api.ipify.org?format=json';
// export async function ipify() {
//     return fetch(IPIFY_ENDPOINT_IPV6)
//         .then(response => response.json())
// }

var timer;
var events = [];
var requestUrl = '';
var MAX_CACHE_LEN = 5;
var MAX_WAITING_TIME = 5000;
/**
 * emit monitor data
 * @param {*} data the event with type, name and data
 */
function emit(data) {
    console.log('emit', data);
    data.timeStamp = Date.now();
    data.platform = getPlatform();
    data.browser = getBrowserInfo();
    events.push(data);
    clearTimeout(timer);
    events.length >= MAX_CACHE_LEN
        ? send()
        : timer = setTimeout(send, MAX_WAITING_TIME);
}
/**
 * send request in requestIdleCallback()
 * by navigator.sendBeacon, request will not be broken when close blower
 */
function send() {
    if (events.length) {
        var sendEvents = events.slice(0, MAX_CACHE_LEN);
        events = events.slice(MAX_CACHE_LEN);
        navigator.sendBeacon(requestUrl, JSON.stringify(sendEvents));
        if (events.length) {
            window.requestIdleCallback(function () { return setTimeout(send, 17); });
        }
    }
}
function SetEmitOptions(url, sendlen, timelimit) {
    if (sendlen === void 0) { sendlen = 5; }
    if (timelimit === void 0) { timelimit = 5000; }
    requestUrl = url;
    MAX_WAITING_TIME = timelimit;
    MAX_CACHE_LEN = sendlen;
}

// 可容忍的最大等待首屏时间
// const MAX_WAIT_LOAD_TIME = 3000
var perfEntries = window.performance.getEntriesByType("navigation")[0];
var n = perfEntries;
window.performance.getEntriesByType("resource")[0];
var perfInfo = {};
var getPerformanceData = function (isLoaded) {
    if (!isLoaded) {
        console.warn('首屏异常');
    }
    // dns时间（如有缓存为0）
    var dns = n.domainLookupEnd - n.domainLookupStart;
    // 从 请求开始 到 DOM解析完成的时间
    var domReady = n.domContentLoadedEventEnd - n.fetchStart;
    var tcp = n.connectEnd - n.connectStart;
    var req = n.responseEnd - n.requestStart;
    var domParse = n.domComplete - n.domInteractive;
    var url = window.location.href;
    perfInfo = {
        dns: dns,
        domReady: domReady,
        tcp: tcp,
        req: req,
        domParse: domParse,
        url: url
    };
    emit({ type: 'Performance', name: 'NavigationTimeData', data: perfInfo });
    // const dcl = n.domContentLoadedEventStart - n.fetchStart
    // emit({type: 'Performance', name: 'dcl', data: dcl})
};
var isDataLoaded = function (entry) {
    return (entry && entry.loadEventEnd !== 0 && entry.responseEnd !== 0 && entry.domComplete !== 0);
};
/**
 * 异步检测performance数据是否加载完成
 */
var initNavigationData = function () {
    if (isDataLoaded(n)) {
        getPerformanceData(true);
    }
    else {
        window.setTimeout(initNavigationData, 0);
    }
};
var initPaintData = function () {
    var observer = new PerformanceObserver(function (list) {
        for (var _i = 0, _a = list.getEntries(); _i < _a.length; _i++) {
            var entry = _a[_i];
            emit({ type: 'Performance', name: entry.name, data: { time: entry.startTime } });
        }
    });
    observer.observe({ entryTypes: ['paint'] });
};
var initPerformance = function () {
    initNavigationData();
    initPaintData();
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * base类，接口、过滤接口
 *
 */
var BaseInterceptor = /** @class */ (function () {
    function BaseInterceptor(ignoreList) {
        this._ignoreList = ignoreList;
    }
    BaseInterceptor.prototype.isUrlInIgnoreList = function (url) {
        if (!this._ignoreList)
            return false;
        return this._ignoreList.some(function (urlItem) {
            return url === null || url === void 0 ? void 0 : url.includes(urlItem);
        });
    };
    return BaseInterceptor;
}());

var AjaxInterceptor = /** @class */ (function (_super) {
    __extends(AjaxInterceptor, _super);
    function AjaxInterceptor(ignoreList) {
        return _super.call(this, ignoreList) || this;
    }
    AjaxInterceptor.prototype.init = function () {
        if (!XMLHttpRequest)
            return; //XML不存在则返回  看浏览器兼容性
        var Oldopen = XMLHttpRequest.prototype.open;
        var self = this; //self为类实例
        XMLHttpRequest.prototype.open = function (//劫持open方法
        method, url, async) {
            this._url = typeof url === 'string' ? url : url.href;
            this._method = method;
            this._isUrlInIgnoreList = self.isUrlInIgnoreList(this._url); //是否需要过滤，防止死循环
            return Oldopen.call(this, method, this._url, typeof async === "boolean" ? async : true);
        };
        var Olesend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function () {
            var rest = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                rest[_i] = arguments[_i];
            }
            var stack = new Error().stack;
            var body = rest[0];
            var requestData = body;
            var sendTime = Date.now(); //记录发送时间
            this.addEventListener("readystatechange", function () {
                if (this._isUrlInIgnoreList) {
                    return; //跳过发送给监测系统的请求
                }
                if (this.readyState === 4) { //当state为4,所有相应数据接收完毕
                    if (this.status >= 200 && this.status < 300) { //请求成功
                        var successDataLog = {
                            duration: Date.now() - sendTime,
                            requestUrl: this.responseURL,
                            sendTime: sendTime,
                            requestMethod: this._method,
                            requestData: requestData,
                            status: this.status
                        };
                        // console.log(successDataLog) 
                        emit({
                            type: 'Request',
                            name: 'xhr-success',
                            data: successDataLog
                        });
                    }
                    else { //请求失败
                        var errorDataLog = {
                            requestMethod: this._method,
                            requestUrl: this._url,
                            requestData: requestData,
                            stack: stack,
                            sendTime: sendTime,
                            status: this.status //状态码
                        };
                        console.log(errorDataLog);
                        emit({
                            type: 'Request',
                            name: 'xhr-error',
                            data: errorDataLog
                        });
                    }
                }
            });
            return Olesend.call(this, body);
        };
    };
    return AjaxInterceptor;
}(BaseInterceptor));

var FetchInterceptor = /** @class */ (function (_super) {
    __extends(FetchInterceptor, _super);
    function FetchInterceptor(ignoreList) {
        return _super.call(this, ignoreList) || this;
    }
    FetchInterceptor.prototype.init = function () {
        var OldFetch = fetch;
        var self = this;
        Object.defineProperty(window, "fetch", {
            configurable: true,
            enumerable: true,
            get: function () {
                var _this = this;
                return function (url, options) {
                    if (options === void 0) { options = {}; }
                    _this._url = url;
                    _this._method = options.method || 'get';
                    _this._data = options.body;
                    var stack = new Error().stack;
                    _this._isUrlInIgnoreList = self.isUrlInIgnoreList(_this._url);
                    var sendTime = Date.now(); //发送请求的开始时间
                    return OldFetch(url, options)
                        .then(function (res) {
                        var status = res.status;
                        var successDataLog = {
                            status: status,
                            requestUrl: res.url,
                            sendTime: sendTime,
                            requestMethod: _this._method,
                            requestData: _this._data,
                            duration: Date.now() - sendTime
                        };
                        // console.log(successDataLog)
                        var errorDataLog = {
                            requestMethod: _this._method,
                            requestUrl: _this._url,
                            requestData: _this._data,
                            errorMsg: res.statusText,
                            status: res.status,
                            sendTime: sendTime,
                            stack: stack
                        };
                        // console.log(res)
                        if (!_this._isUrlInIgnoreList) {
                            if (status >= 200 && status < 300) {
                                emit({
                                    type: 'Request',
                                    name: 'fetch-success',
                                    data: successDataLog
                                });
                            }
                            else {
                                emit({
                                    type: 'Request',
                                    name: 'fetch-error',
                                    data: errorDataLog
                                });
                            }
                        }
                        return Promise.resolve(res);
                    })["catch"](function (e) {
                        var errorLog = {
                            requestMethod: _this._method,
                            requestUrl: _this._url,
                            requestData: _this._data,
                            sendTime: sendTime,
                            stack: e.stack,
                            errorMsg: e.message
                        };
                        if (!_this._isUrlInIgnoreList) {
                            // console.log(e)
                            emit({
                                type: 'Request',
                                name: 'fetch-failconnect',
                                data: errorLog
                            });
                        }
                    });
                };
            }
        });
    };
    return FetchInterceptor;
}(BaseInterceptor));

var igoreUrlArr = []; //可自行设置需要过滤的请求url
function SetUrlIgnoreList(arrs) {
    igoreUrlArr = arrs;
}
setTimeout(function () {
    var ajaxInterceptor = igoreUrlArr ? new AjaxInterceptor(igoreUrlArr) : new AjaxInterceptor(); //(igoreUrlArr)可选：过滤url
    ajaxInterceptor.init();
    var fetchInterceptor = igoreUrlArr ? new FetchInterceptor(igoreUrlArr) : new FetchInterceptor();
    fetchInterceptor.init();
}, 0);

var oldURL = window.location.href;
/*
* PV UV 自定义行为埋点 页面停留时间 用户热点页面
* */
var initUser = function () {
    emit({ type: 'User', name: 'enter', data: {
            'user': document.cookie.split('=')[1],
            'url': window.location.href
        } });
    // window.addEventListener('hashchange', () => {
    //     console.log(111)
    //     emit({
    //         type: 'User', name: 'pv', data: {
    //             ip,
    //             'url': window.location.href
    //         }
    //     })
    // })
    /*hashchange、pushState、replaceState、popstate、beforeunload
    * */
    window.addEventListener('popstate', function () {
        emit({
            type: 'User', name: 'leave', data: {
                'user': document.cookie.split('=')[1],
                'url': oldURL
            }
        });
        emit({
            type: 'User', name: 'enter', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            }
        });
    });
    /*    window.addEventListener('pushState', () => {
            emit({
                type: 'User', name: 'push event', data: {
                    'user': document.cookie.split('=')[1],
                    'url': window.location.href
                }
            })
        })*/
    /*    window.addEventListener('replaceState', () => {
            emit({
                type: 'User', name: 'replace event', data: {
                    'user': document.cookie.split('=')[1],
                    'url': window.location.href
                }
            })
        })*/
    var oldPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        emit({ type: 'User', name: 'leave', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            } });
        oldPushState.apply(void 0, args);
        oldURL = window.location.href;
        emit({ type: 'User', name: 'enter', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            } });
    };
    var oldReplaceState = window.history.replaceState.bind(window.history);
    window.history.replaceState = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        emit({ type: 'User', name: 'leave', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            } });
        oldReplaceState.apply(void 0, args);
        oldURL = window.location.href;
        emit({ type: 'User', name: 'enter', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            } });
    };
    window.addEventListener('beforeunload', function () {
        window.alert('leave');
        emit({ type: 'User', name: 'leave', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            } });
    });
};

var ErrorInterceptor = /** @class */ (function () {
    function ErrorInterceptor() {
    }
    ErrorInterceptor.prototype.init = function () {
        var errorSet = new Set();
        function errorEmit(info) {
            var errorTag = info.type + info.data.reason + info.data.url;
            if (!errorSet.has(errorTag)) {
                emit(info);
                errorSet.add(errorTag);
            }
        }
        var handler = function (event) {
            var target = event.target || event.srcElement;
            var isElementTarget = target instanceof HTMLScriptElement ||
                target instanceof HTMLImageElement;
            if (!isElementTarget)
                return false;
            var url = target.src;
            errorEmit({ type: 'Error', name: 'Resource Error', data: { url: url, reason: target instanceof HTMLImageElement ? 'Image Load Error' : 'Script Load Error' } });
        };
        window.removeEventListener('error', handler);
        window.addEventListener('error', handler, true);
        window.onerror = function (msg, url, row, col) {
            if (row === void 0) { row = 1; }
            if (col === void 0) { col = 1; }
            errorEmit({ type: 'Error', name: 'JS Error', data: { reason: msg.toString(), url: url, row: row, col: col } });
            return true;
        };
        var handler2 = function (event) {
            errorEmit({ type: 'Error', name: 'Promise Error', data: { reason: event.reason, url: window.location.href } });
        };
        window.removeEventListener('unhandledrejection', handler2);
        window.addEventListener('unhandledrejection', handler2, true);
        var _error = console.error;
        console.error = function (error) {
            errorEmit({ type: 'Error', name: 'Console Error', data: { reason: error, url: window.location.href } });
            _error.call(console, error);
        };
    };
    return ErrorInterceptor;
}());

var initMonitor = function (options) {
    initPerformance();
    initUser();
    var errorInterceptor = new ErrorInterceptor();
    errorInterceptor.init();
    console.log('monitor plugin installed');
    SetEmitOptions(options.setsetEmitUrl, options.setEmitLen, options.setEmitTime);
    SetUrlIgnoreList(options.setUrlIgnoreList);
};

export { initMonitor };
