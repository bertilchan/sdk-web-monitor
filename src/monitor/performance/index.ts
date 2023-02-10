import {emit} from '../../utils/emit'

// 可容忍的最大等待首屏时间
// const MAX_WAIT_LOAD_TIME = 3000

const [perfEntries] = window.performance.getEntriesByType("navigation");
const n = perfEntries as PerformanceNavigationTiming
const [resourceEntries] = window.performance.getEntriesByType("resource");
const resourceEntry = resourceEntries as PerformanceResourceTiming

let perfInfo = {}
const getPerformanceData = (isLoaded: boolean) => {
  if (!isLoaded) {
    console.warn('首屏异常')
  }

  // dns时间（如有缓存为0）
  const dns = n.domainLookupEnd - n.domainLookupStart
  // 从 请求开始 到 DOM解析完成的时间
  const domReady = n.domContentLoadedEventEnd - n.fetchStart

  const tcp = n.connectEnd - n.connectStart;
  const req = n.responseEnd - n.requestStart;
  const domParse = n.domComplete - n.domInteractive;


  const url = window.location.href
  perfInfo = {
    dns,
    domReady,
    tcp,
    req,
    domParse,
    url,
  }
  emit({type: 'Performance', name: 'NavigationTimeData', data: perfInfo})

  // const dcl = n.domContentLoadedEventStart - n.fetchStart
  // emit({type: 'Performance', name: 'dcl', data: dcl})
}

const isDataLoaded = (entry: PerformanceNavigationTiming): boolean => {
  return (
      entry && entry.loadEventEnd !== 0 && entry.responseEnd !== 0 && entry.domComplete !== 0
  );
}

/**
 * 异步检测performance数据是否加载完成
 */
const initNavigationData = () => {
  if (isDataLoaded(n)) {
    getPerformanceData(true)
  } else {
    window.setTimeout(initNavigationData, 0);
  }
}

const initPaintData = () => {
  const observer = new PerformanceObserver(list => {
    for(const entry of list.getEntries()) {
      emit({type: 'Performance', name: entry.name, data: {time: entry.startTime}})
    }
  })
  observer.observe({entryTypes:['paint']})
}


const initPerformance = () => {
  initNavigationData()
  initPaintData()
}


export {initPerformance}