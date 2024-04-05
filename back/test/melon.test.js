import {
  describe,
  expect, it,
} from 'vitest';

import { fetchChart, fetchChartsForDateRangeInParallel } from '../dataCollecting/melon.js';

// - `일` 기준
//     - `2010.01.03~2010.01.09` 시작
//     - `2012.08.05 ~ 2012.08.11`마지막
// - `월` 기준
//     - `2012.08.13 ~ 2012.08.19` 시작
//     - 쭉
describe('The fetchChart func Test', () => {
  it('The Melon weekly chart has been available since January 3, 2010.So fetchChart("2010", "01", "02", "WE") is going to throw Error.', () => {
    expect(() => fetchChart('2010', '01', '02', 'WE')).rejects.toThrowError('The Melon weekly chart has been available since January 3, 2010.');
    expect.assertions(1);
  });
  it('For the period from January 3, 2010, to August 11, 2012, the standard is Sunday. For other days of the week, chartDetails will return an empty array.', async () => {
    const { chartDetails } = await fetchChart('2010', '01', '04', 'WE');
    expect(chartDetails.length).toBe(0);
    expect.assertions(1);
  });
  it('The Melon weekly chart has been available since January 3, 2010. So So fetchChart("2010", "01", "03", "WE") is enable.', async () => {
    const { chartDetails, chartScope } = await fetchChart('2010', '01', '03', 'WE');
    const { startDate, endDate, chartType } = chartScope;
    expect(chartType).toBe('WE');
    expect(startDate.getTime()).toBe(new Date('2010-01-03').getTime());
    expect(endDate.getTime()).toBe(new Date('2010-01-09').getTime());
    expect(chartDetails[0]).toHaveProperty('rank');
    expect(chartDetails[0]).toHaveProperty('artist');
    expect(chartDetails[0]).toHaveProperty('title');
    expect.assertions(6);
  });
});

describe('fetchChartsForDateRangeInParallel', () => {
  it('It can obtain monthly charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-01'), new Date('2024-03-01'), 'MO');
    const { chartScope: chartScope2M } = result.find(item => item.chartScope.date.getDate() === new Date('2024-02-01').getDate());
    const { chartScope: chartScope3M } = result.find(item => item.chartScope.date.getDate() === new Date('2024-03-01').getDate());
    expect(result.length).toBe(2);
    expect(chartScope2M.date.getTime() === new Date('2024-02-01').getDate());
    expect(chartScope3M.date.getTime() === new Date('2024-03-01').getDate());
    expect.assertions(3);
  });

  it('It can obtain weekly charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-05'), new Date('2024-02-16'), 'WE');
    const { chartScope: chartScope2M2W } = result.find(item => item.chartScope.startDate.getDate() === new Date('2024-02-05').getDate());
    const { chartScope: chartScope2M3W } = result.find(item => item.chartScope.startDate.getDate() === new Date('2024-02-12').getDate());
    expect(result.length).toBe(2);
    expect(chartScope2M2W.startDate.getTime() === new Date('2024-02-05').getDate());
    expect(chartScope2M3W.startDate.getTime() === new Date('2024-02-12').getDate());
    expect.assertions(3);
  });
});
