import { emit } from "../../utils/emit";
import { IHttpReqErrorRes, IlogData, inoreTYPE, BaseInterceptor} from "./base"


export class AjaxInterceptor extends BaseInterceptor {

  constructor(ignoreList?: inoreTYPE){
    super(ignoreList)
  }

  init(): void {
    if (!XMLHttpRequest) return ; //XML不存在则返回  看浏览器兼容性
    const Oldopen = XMLHttpRequest.prototype.open
    const self = this //self为类实例

    XMLHttpRequest.prototype.open = function(//劫持open方法
      method: string,
      url: string | URL,
      async?: boolean
    ){
      this._url = typeof url === 'string' ? url : url.href
      this._method = method
      this._isUrlInIgnoreList=self.isUrlInIgnoreList(this._url)//是否需要过滤，防止死循环

      return Oldopen.call(
        this,
        method,
        this._url,
        typeof async === "boolean" ? async : true
      )
    }

    const Olesend = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.send = function (...rest: any[]) {
      const stack = new Error().stack
      const body = rest[0]
      const requestData: string = body
      const sendTime = Date.now() //记录发送时间
      this.addEventListener("readystatechange", function () {
        if (this._isUrlInIgnoreList){
          return //跳过发送给监测系统的请求
        }
        
        if (this.readyState === 4 ) {//当state为4,所有相应数据接收完毕
          if (this.status >=200 && this.status < 300) {//请求成功
            const successDataLog: IlogData = {
              duration: Date.now() - sendTime,
              requestUrl: this.responseURL,
              sendTime,
              requestMethod: this._method,
              requestData,
              status: this.status
            }
            // console.log(successDataLog) 
            emit({
              type: 'Request',
              name: 'xhr-success',
              data: successDataLog,
            })
          } else {//请求失败
            const errorDataLog: IHttpReqErrorRes = {
              requestMethod: this._method,
              requestUrl: this._url,
              requestData,//请求体
              stack,
              sendTime,
              status: this.status //状态码
            }
            console.log(errorDataLog) 
            emit({
              type: 'Request',
              name: 'xhr-error',
              data: errorDataLog,
            })
          }
        }
      })

      return Olesend.call(this, body)
    }
  }
}