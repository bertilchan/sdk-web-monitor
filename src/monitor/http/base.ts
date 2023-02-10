/**
 * base类，接口、过滤接口
 * 
 */

 export interface IHttpReqErrorRes { //请求失败-上报http类型错误接口
  requestMethod: string | undefined
  requestUrl: string | undefined
  requestData?: any  //请求体
  timeStamp?: number //当前上报时间
  sendTime: number | undefined
  stack: any
  errorMsg?: string | undefined //错误信息
  status?: number //状态码
}

export interface IlogData {//请求成功-上报数据接口
  requestMethod: string
  requestUrl: string //请求地址
  requestData?: any
  timeStamp?: number //当前时间
  duration?: number //持续时间
  sendTime?: number
  status: number //状态码
}


export type inoreTYPE = string[] | null | undefined //过滤type

export class BaseInterceptor {
  public _ignoreList: inoreTYPE

  constructor(ignoreList?: inoreTYPE){
    this._ignoreList=ignoreList
  }

  isUrlInIgnoreList(url: string): boolean {
    if(!this._ignoreList ) return false

    return this._ignoreList.some((urlItem)=>{
      return url?.includes(urlItem)
    })
  }
}
