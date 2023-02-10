import {IlogData,IHttpReqErrorRes} from "../lib/xhr"
/**
 * performance data
 */
export interface performance {
    duration?: number
}

/*
*  user data
* */
export interface user {

}

export interface Request extends IlogData,IHttpReqErrorRes{
}
/**
 * event is monitor data unit
 * @param {*} type Error | Performance | User
 * @param {*} name the name of event
 * @param {*} data the data of event
 * @param {*} uuid the uuid of event
 * @param {*} timeStamp the timeStamp of event
 * @param {*} browser the browser of event
 * @param {*} platform the platform of event
 * @param {*} sessionId the sessionId of event
 * @param {*} userUuid the userUuid of event
 */
export interface event {
    type: 'Error' | 'Performance' | 'User' | 'Request'
    name: string
    data: any
    uuid?: string
    timeStamp?: number
    browser?: string
    platform?: string
    sessionId?: string
    userUuid?: string
}

export interface PerformanceEntryHandler {
    (entry: PerformanceEntry): void
}

export interface OnHiddenCallback {
    (event: Event): void
}