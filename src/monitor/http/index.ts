import {AjaxInterceptor} from './xhr'
import {FetchInterceptor} from './fetch'
import {inoreTYPE} from './base'

let igoreUrlArr: inoreTYPE = [] //可自行设置需要过滤的请求url

export function SetUrlIgnoreList(arrs: string[] | undefined ){
  igoreUrlArr = arrs
}

setTimeout(()=>{//放进宏任务队列中执行
const ajaxInterceptor= igoreUrlArr ? new AjaxInterceptor(igoreUrlArr) : new AjaxInterceptor() //(igoreUrlArr)可选：过滤url
ajaxInterceptor.init()
const fetchInterceptor= igoreUrlArr ? new FetchInterceptor(igoreUrlArr) : new FetchInterceptor()
fetchInterceptor.init()
},0)
