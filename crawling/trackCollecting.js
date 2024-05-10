/* eslint-disable no-restricted-syntax */
import crawlingDomesticPlatformCharts from './src/services/collectData.js';
import winLogger from './src/util/winston.js';

// !!!주의사항!!!
// 1. 크롤링 후 데이터는 검수과정이 필요합니다. 이미 아래 기간은 검수를 거친 파일이 생성되어있습니다.
//    실행시 검수를 거친 내역이 초기화 되니 주의해야함!!!
//    매우 주의해야하기때문에 package.json에서 빼겠음!!

const dateRanges = [
  { start: '2024-01-01', end: '2024-05-05' },
  { start: '2023-01-02', end: '2023-12-31' },
  { start: '2022-01-03', end: '2023-01-01' },
  { start: '2021-01-04', end: '2022-01-02' },
  { start: '2019-12-30', end: '2021-01-03' },
  { start: '2018-12-31', end: '2019-12-29' },
];

for await (const range of dateRanges) {
  await crawlingDomesticPlatformCharts(new Date(range.start), new Date(range.end), 'w');
  winLogger.info('crawlingDomesticPlatformCharts done', { range });
}
winLogger.info('all done..');
