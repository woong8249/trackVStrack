import {
  describe,
  expect, it,
} from 'vitest';

import { fetchChart, fetchChartsForDateRangeInParallel } from '../src/dataCollecting/domestic/bugs.js';
import { extractYearMonthDay } from '../src/util/time.js';

import { getRandomDateRange, moveToNearestFutureDay } from './util.js';

describe('The fetchChart func Test', () => {
  it('The Bugs daily chart has been available since September 22, 2006. So fetchChart(\'2006\', \'03\', \'21\', \'d\') is going to throw Error.', () => {
    expect(() => fetchChart('2006', '03', '21', 'd')).rejects.toThrowError('The Bugs daily chart has been available since September 22, 2006.');
    expect.assertions(1);
  });

  it('The Bugs daily chart has been available since September 22, 2006. It will test using a randomly selected Monday after this date.', async () => {
    const minDate = new Date('2006-03-22');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = moveToNearestFutureDay(_startDate, 1);
    const { year, month, day } = extractYearMonthDay(testTarget);
    const { chartDetails, chartScope } = await fetchChart(year, month, day, 'd');
    const { chartType } = chartScope;

    expect(chartType).toBe('d');
    expect(chartDetails[0]).toHaveProperty('rank');
    expect(chartDetails[0]).toHaveProperty('artists');
    expect(chartDetails[0]).toHaveProperty('title');
    expect.assertions(4);
  });

  it('The Bugs weekly chart has been available since August 29, 2003. So fetchChart(\'2003\', \'08\', \'28\', \'w\') is going to throw Error.', () => {
    expect(() => fetchChart('2003', '08', '28', 'w')).rejects.toThrowError('The Bugs weekly chart has been available since August 29, 2003.');
    expect.assertions(1);
  });

  it('The Bugs monthly chart has been available since January 1, 2010. We will test using a randomly selected first day of month after this date.', async () => {
    const minDate = new Date('2003-08-29');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = new Date(_startDate.setDate(1));
    const { year, month, day } = extractYearMonthDay(testTarget);
    const { chartDetails, chartScope } = await fetchChart(year, month, day, 'w');
    const { chartType, weekOfMonth } = chartScope;

    expect(chartType).toBe('w');
    expect(weekOfMonth).toHaveProperty('week');
    expect(weekOfMonth).toHaveProperty('month');
    expect(weekOfMonth).toHaveProperty('year');
    expect(chartDetails[0]).toHaveProperty('rank');
    expect(chartDetails[0]).toHaveProperty('artists');
    expect(chartDetails[0]).toHaveProperty('title');
    expect.assertions(7);
  });
});

describe('fetchChartsForDateRangeInParallel', () => {
  it('It can obtain daily charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-21'), new Date('2024-03-01'), 'd');
    const { chartScope: chartScope2M } = result.find(item => item.chartScope.date.getDate() === new Date('2024-02-01').getDate());
    const { chartScope: chartScope3M } = result.find(item => item.chartScope.date.getDate() === new Date('2024-03-01').getDate());
    expect(result.length).toBe(10);
    expect(chartScope2M.date.getTime() === new Date('2024-02-21').getDate());
    expect(chartScope3M.date.getTime() === new Date('2024-03-01').getDate());
    expect.assertions(3);
  });
  it('It can obtain weekly charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-05'), new Date('2024-02-16'), 'w');
    const { chartScope: chartScope2M2W } = result.find(item => item.chartScope.startDate.getDate() === new Date('2024-02-05').getDate());
    const { chartScope: chartScope2M3W } = result.find(item => item.chartScope.startDate.getDate() === new Date('2024-02-12').getDate());
    expect(result.length).toBe(2);
    expect(chartScope2M2W.startDate.getTime() === new Date('2024-02-05').getDate());
    expect(chartScope2M3W.startDate.getTime() === new Date('2024-02-12').getDate());
    expect.assertions(3);
  });
});
