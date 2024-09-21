/* eslint-disable max-len */
import {
  describe,
  expect, it,
} from 'vitest';

import {
  fetchAdditionalInformationOfTrack,
  fetchChart, fetchChartsForDateRangeInParallel, MelonFetchWeeklyChartResult, type MelonFetchMonthlyChartResult,
} from '../src/platforms/melon';
import { MonthlyChartScope, WeeklyChartScope } from '../src/types';
import { getRandomDateRange, moveToNearestFutureDay } from './util';
import { extractYearMonthDay } from '../src/util/time';

describe('Test func fetchChart', () => {
  it('The Melon weekly chart has been available since January 3, 2010.So fetchChart(\'2010\', \'01\', \'02\', \'w\') is going to throw Error.', async () => {
    await expect(() => fetchChart('2010', '01', '02', 'w')).rejects.toThrowError('The Melon weekly chart has been available since January 3, 2010.');
    expect.assertions(1);
  });

  // The Melon weekly Chart dates are as follows:
  // Sunday basis:
  //   Start: January 3, 2010, to January 9, 2010
  //   End: August 5, 2012, to August 11, 2012
  // Monday basis:
  //   Start: August 13, 2012, to August 19, 2012
  //   Ongoing to the present
  it('The Melon weekly chart has been available since January 3, 2010. We will test using a randomly selected Monday after this date.', async () => {
    const minDate = new Date('2012-08-13');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = moveToNearestFutureDay(_startDate, 1);
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

  it('The Melon monthly chart has been available since January 1, 2010. So fetchChart(\'2009\', \'12\', \'30\', \'m\') is going to throw Error.', async () => {
    await expect(() => fetchChart('2009', '12', '30', 'm')).rejects.toThrowError('The Melon monthly chart has been available since January 1, 2010.');
    expect.assertions(1);
  });

  it('The Melon monthly chart has been available since January 1, 2010. We will test using a randomly selected first day of month after this date.', async () => {
    const minDate = new Date('2012-01-01');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = new Date(_startDate.setDate(1));
    const { year, month, day } = extractYearMonthDay(testTarget);
    const { chartDetails, chartScope } = await fetchChart(year, month, day, 'm');
    const { chartType } = chartScope;

    expect(chartType).toBe('m');
    expect(chartDetails[0]).toHaveProperty('rank');
    expect(chartDetails[0]).toHaveProperty('artists');
    expect(chartDetails[0]).toHaveProperty('title');
    expect.assertions(4);
  });
});

describe('Test func fetchChartsForDateRangeInParallel', () => {
  it('It can obtain monthly charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-01'), new Date('2024-03-01'), 'm');
    const { chartScope: chartScope2M } = result.find((item : MelonFetchMonthlyChartResult) => item.chartScope.date.getDate() === new Date('2024-02-01').getDate()) as {chartScope: MonthlyChartScope};
    const { chartScope: chartScope3M } = result.find((item :MelonFetchMonthlyChartResult) => item.chartScope.date.getDate() === new Date('2024-03-01').getDate()) as { chartScope: MonthlyChartScope};
    expect(result.length).toBe(2);
    expect(chartScope2M.date.getTime() === new Date('2024-02-01').getTime());
    expect(chartScope3M.date.getTime() === new Date('2024-03-01').getTime());
    expect.assertions(3);
  });

  it('It can obtain weekly charts for a specific period.', async () => {
    const result = await fetchChartsForDateRangeInParallel(new Date('2024-02-05'), new Date('2024-02-16'), 'w');
    const { chartScope: chartScope2M2W } = result.find((item:MelonFetchWeeklyChartResult) => item.chartScope.startDate.getDate() === new Date('2024-02-05').getDate()) as {chartScope: WeeklyChartScope};
    const { chartScope: chartScope2M3W } = result.find((item:MelonFetchWeeklyChartResult) => item.chartScope.startDate.getDate() === new Date('2024-02-12').getDate())as {chartScope: WeeklyChartScope};
    expect(result.length).toBe(2);
    expect(chartScope2M2W.startDate.getTime() === new Date('2024-02-05').getDate());
    expect(chartScope2M3W.startDate.getTime() === new Date('2024-02-12').getDate());
    expect.assertions(3);
  });
});

describe('Test func fetchAdditionalInformationOfTrack', () => {
  it('This function can fetch the releaseDate,trackImage and lyrics.', async () => {
    const { releaseDate, trackImage, lyrics } = await fetchAdditionalInformationOfTrack('36713849');
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\\/?%&=]*)?$/;
    const isURL = urlPattern.test(trackImage);
    expect(releaseDate.getTime()).toBe(new Date('2023-08-21').getTime());
    expect(isURL).toBe(true);
    expect(lyrics.length > 100).toBe(true);
    expect.assertions(3);
  });
});

// describe('Test fetchRealTimeChart', () => {
//   it('check properties', async () => {
//     const randomIndex = Math.floor(Math.random() * 100);
//     const result = await fetchRealTimeChart();
//     const target = result[randomIndex];
//     expect(target);
//     expect(target).toHaveProperty('rank');
//     expect(target).toHaveProperty('artists');
//     expect(target).toHaveProperty('title');
//     expect(target).toHaveProperty('titleKeyword');
//     expect(target).toHaveProperty('trackID');
//     expect(target).toHaveProperty('thumbnail');
//   });
// });
