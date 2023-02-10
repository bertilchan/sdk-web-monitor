import { emit } from '../../utils/emit'
import { ErrorInfo, ResourceErrorInfo } from '../../types/error'
export class ErrorInterceptor {
    init(): void {
        let errorSet:Set<string> = new Set()
        
        function errorEmit(info: ErrorInfo) {
            let errorTag:string = info.type + info.data.reason + info.data.url
            if(!errorSet.has(errorTag)) {
                emit(info)
                errorSet.add(errorTag)
            }
        }
        const handler = (event:any) => {
            const target: any = event.target || event.srcElement
            const isElementTarget =
                target instanceof HTMLScriptElement ||
                target instanceof HTMLImageElement
            if (!isElementTarget) return false
            let url: string = target.src
            errorEmit({ type: 'Error', name: 'Resource Error', data: {url, reason: 
                target instanceof HTMLImageElement ? 'Image Load Error' : 'Script Load Error'} })
        }
        window.removeEventListener('error', handler)
        window.addEventListener('error', handler, true)

        window.onerror = (msg, url, row = 1, col = 1) => {
            errorEmit({type: 'Error', name: 'JS Error', data: {reason: msg.toString(), url, row, col}})
            return true
        }
        const handler2 = function(event:any) {
            errorEmit({type: 'Error', name: 'Promise Error', data: {reason: event.reason, url: window.location.href}})
        }
        window.removeEventListener('unhandledrejection', handler2)
        window.addEventListener('unhandledrejection', handler2, true);

        const _error = console.error
        console.error = error => {
            errorEmit({type: 'Error', name: 'Console Error', data: {reason: error, url: window.location.href}})
            _error.call(console, error)
        }
    }
}
