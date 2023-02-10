import {emit} from "../../utils/emit";
import {event} from "../../types/env";

let oldURL = window.location.href
/*
* PV UV 自定义行为埋点 页面停留时间 用户热点页面
* */
const initUser = () => {
    emit({type: 'User', name: 'enter', data: {
            'user': document.cookie.split('=')[1],
            'url': window.location.href
        }})
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
    window.addEventListener('popstate', () => {
        emit({
            type: 'User', name: 'leave', data: {
                'user': document.cookie.split('=')[1],
                'url': oldURL
            }
        })
        emit({
            type: 'User', name: 'enter', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            }
        })
    })
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
    const oldPushState = window.history.pushState.bind(window.history);
    window.history.pushState = (...args) => {
        emit({type: 'User', name: 'leave', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            }})
        oldPushState(...args)
        oldURL = window.location.href
        emit({type: 'User', name: 'enter', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            }})
    }
    const oldReplaceState = window.history.replaceState.bind(window.history)
    window.history.replaceState = (...args) => {
        emit({type: 'User', name: 'leave', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            }})
        oldReplaceState(...args)
        oldURL = window.location.href
        emit({type: 'User', name: 'enter', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            }})
    }
    window.addEventListener('beforeunload', () => {
        window.alert('leave')
        emit({type: 'User', name: 'leave', data: {
                'user': document.cookie.split('=')[1],
                'url': window.location.href
            }})
    })
}


export {initUser}