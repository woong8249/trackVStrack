import {
  describe,
  expect, it,
} from 'vitest';

import { fetchChart, fetchChartsForDateRangeInParallel } from '../dataCollecting/genie.js';
import { extractYearMonthDay } from '../dataCollecting/util.js';

import { getRandomDateRange, moveToNearestFutureDay } from './util.js';

// Genie's weekly chart has been based on Mondays since March 25, 2012, up to the present.
describe('The fetchChart func Test', () => {
  it('The Genie daily chart is available starting from March 28, 2012.So fetchChart(\'2012\', \'03\', \'28\', \'D\') is going to throw Error.', () => {
    expect(() => fetchChart('2012', '03', '27', 'D')).rejects.toThrowError('The Genie daily chart is available starting from March 28, 2012.');
    expect.assertions(1);
  });

  it('The Genie daily chart is available starting from March 28. We will test using a randomly selected day after this date.', async () => {
    const minDate = new Date('2012-08-13');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = moveToNearestFutureDay(_startDate, 1);
    const { year, month, day } = extractYearMonthDay(testTarget);
    const { chartDetails, chartScope } = await fetchChart(year, month, day, 'D');
    const { chartType } = chartScope;
    expect(chartType).toBe('D');
    expect(chartDetails[0]).toHaveProperty('rank');
    expect(chartDetails[0]).toHaveProperty('artist');
    expect(chartDetails[0]).toHaveProperty('title');
    expect.assertions(4);
  });

  it('The Genie weekly chart is available starting from March 25, 2012.So fetchChart(\'2012\', \'03\', \'24\', \'W\') is going to throw Error.', () => {
    expect(() => fetchChart('2012', '03', '24', 'W')).rejects.toThrowError('The Genie weekly chart is available starting from March 25, 2012.');
    expect.assertions(1);
  });

  it('The Genie weekly chart has been based on Mondays since March 25, 2012. We will test using a randomly selected day after this date.', async () => {
    const minDate = new Date('2012-03-25');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = moveToNearestFutureDay(_startDate, 1);
    const { year, month, day } = extractYearMonthDay(testTarget);
    const { chartDetails, chartScope } = await fetchChart(year, month, day, 'W');
    const { chartType } = chartScope;
    expect(chartType).toBe('W');
    expect(chartDetails[0]).toHaveProperty('rank');
    expect(chartDetails[0]).toHaveProperty('artist');
    expect(chartDetails[0]).toHaveProperty('title');
    expect.assertions(4);
  });

  it('The Genie monthly chart is available starting from February 1, 2012.So fetchChart(\'2012\', \'01\', \'15\', \'M\') is going to throw Error.', () => {
    expect(() => fetchChart('2012', '01', '15', 'M')).rejects.toThrowError('The Genie monthly chart is available starting from February 1, 2012.');
    expect.assertions(1);
  });

  it('The Genie monthly chart has been available since February 1, 2012. We will test using a randomly selected first day of month after this date.', async () => {
    const minDate = new Date('2012-01-01');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = new Date(_startDate.setDate(1));
    const { year, month, day } = extractYearMonthDay(testTarget);
    const { chartDetails, chartScope } = await fetchChart(year, month, day, 'M');
    const { chartType } = chartScope;
    expect(chartType).toBe('M');
    expect(chartDetails[0]).toHaveProperty('rank');
    expect(chartDetails[0]).toHaveProperty('artist');
    expect(chartDetails[0]).toHaveProperty('title');
    expect.assertions(4);
  });
});

describe('fetchChartsForDateRangeInParallel', () => {
  it('It can obtain monthly charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-01'), new Date('2024-03-01'), 'M');
    const { chartScope: chartScope2M } = result.find(item => item.chartScope.date.getDate() === new Date('2024-02-01').getDate());
    const { chartScope: chartScope3M } = result.find(item => item.chartScope.date.getDate() === new Date('2024-03-01').getDate());
    expect(result.length).toBe(2);
    expect(chartScope2M.date.getTime() === new Date('2024-02-01').getDate());
    expect(chartScope3M.date.getTime() === new Date('2024-03-01').getDate());
    expect.assertions(3);
  });

  it('It can obtain weekly charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-05'), new Date('2024-02-16'), 'W');
    const { chartScope: chartScope2M2W } = result.find(item => item.chartScope.startDate.getDate() === new Date('2024-02-05').getDate());
    const { chartScope: chartScope2M3W } = result.find(item => item.chartScope.startDate.getDate() === new Date('2024-02-12').getDate());
    expect(result.length).toBe(2);
    expect(chartScope2M2W.startDate.getTime() === new Date('2024-02-05').getDate());
    expect(chartScope2M3W.startDate.getTime() === new Date('2024-02-12').getDate());
    expect.assertions(3);
  });

  it('It can obtain daily charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-21'), new Date('2024-03-01'), 'D');
    const { chartScope: chartScope2M } = result.find(item => item.chartScope.date.getDate() === new Date('2024-02-01').getDate());
    const { chartScope: chartScope3M } = result.find(item => item.chartScope.date.getDate() === new Date('2024-03-01').getDate());
    expect(result.length).toBe(10);
    expect(chartScope2M.date.getTime() === new Date('2024-02-21').getDate());
    expect(chartScope3M.date.getTime() === new Date('2024-03-01').getDate());
    expect.assertions(3);
  });
});
