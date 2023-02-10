import './monitor/performance/index';
import { SetUrlIgnoreList } from './monitor/http/index'
import { initPerformance } from './monitor/performance';
import { initUser } from './monitor/behavior';
import { ErrorInterceptor } from './monitor/errorCatch';
import { SetEmitOptions } from './utils/emit';


export const initMonitor = (options: {
  setsetEmitUrl?: any
  setEmitLen?: number
  setEmitTime?: number
  setUrlIgnoreList?: string[] 
}) => {
  initPerformance();
  initUser();
  const errorInterceptor = new ErrorInterceptor();
  errorInterceptor.init();
  console.log('monitor plugin installed');
  SetEmitOptions(options.setsetEmitUrl,options.setEmitLen,options.setEmitTime)
  SetUrlIgnoreList(options.setUrlIgnoreList)
}
