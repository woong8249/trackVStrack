import {
  describe,
  expect, it,
} from 'vitest';

import genie from '../src/platforms/genie';
import { extractYearMonthDay } from '../src/util/time';

import { getRandomDateRange, moveToNearestFutureDay } from './util';
import type { FetchMonthlyChartResult, FetchWeeklyChartResult } from '../src/types/platform';

// Genie's weekly chart has been based on Mondays since March 25, 2012, up to the present.
describe('The fetchChart func Test', () => {
  it('The Genie weekly chart is available starting from March 25, 2012.So fetchChart(\'2012\', \'03\', \'24\', \'w\') is going to throw Error.', async () => {
    await expect(() => genie.fetchChart('2012', '03', '24', 'w')).rejects.toThrowError('The Genie weekly chart is available starting from March 25, 2012.');
    expect.assertions(1);
  });

  it('The Genie weekly chart has been based on Mondays since March 25, 2012. We will test using a randomly selected day after this date.', async () => {
    const minDate = new Date('2012-03-25');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = moveToNearestFutureDay(_startDate, 1);
    const { year, month, day } = extractYearMonthDay(testTarget);
    const { chartDetails, chartScope } = await genie.fetchChart(year, month, day, 'w') as FetchWeeklyChartResult;
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

  it('The Genie monthly chart is available starting from February 1, 2012.So fetchChart(\'2012\', \'01\', \'15\', \'m\') is going to throw Error.', async () => {
    await expect(() => genie.fetchChart('2012', '01', '15', 'm')).rejects.toThrowError('The Genie monthly chart is available starting from February 1, 2012.');
    expect.assertions(1);
  });

  it('The Genie monthly chart has been available since February 1, 2012. We will test using a randomly selected first day of month after this date.', async () => {
    const minDate = new Date('2012-01-01');
    const today = new Date();
    const { startDate: _startDate } = getRandomDateRange(minDate, today, 1);
    const testTarget = new Date(_startDate.setDate(1));
    const { year, month, day } = extractYearMonthDay(testTarget);
    const { chartDetails, chartScope } = await genie.fetchChart(year, month, day, 'm') as FetchMonthlyChartResult;
    const { chartType } = chartScope;
    expect(chartType).toBe('m');
    expect(chartDetails[0]).toHaveProperty('rank');
    expect(chartDetails[0]).toHaveProperty('artists');
    expect(chartDetails[0]).toHaveProperty('title');
    expect.assertions(4);
  });
});

describe('fetchChartsForDateRangeInParallel', () => {
  it('It can obtain monthly charts for a specific period.', async () => {
    const result = await genie.fetchChartsInParallel(new Date('2024-02-01'), new Date('2024-03-01'), 'm') as FetchMonthlyChartResult[];
    const { chartScope: chartScope2M } = result.find((item) => item.chartScope.date.getDate() === new Date('2024-02-01').getDate()) as FetchMonthlyChartResult;
    const { chartScope: chartScope3M } = result.find((item) => item.chartScope.date.getDate() === new Date('2024-03-01').getDate()) as FetchMonthlyChartResult;
    expect(result.length).toBe(2);
    expect(chartScope2M.date.getTime() === new Date('2024-02-01').getDate());
    expect(chartScope3M.date.getTime() === new Date('2024-03-01').getDate());
    expect.assertions(3);
  });

  it('It can obtain weekly charts for a specific period.', async () => {
    const result = await genie.fetchChartsInParallel(new Date('2024-02-05'), new Date('2024-02-16'), 'w') as FetchWeeklyChartResult[];
    const { chartScope: chartScope2M2W } = result.find((item) => item.chartScope.startDate.getDate() === new Date('2024-02-05').getDate()) as FetchWeeklyChartResult;
    const { chartScope: chartScope2M3W } = result.find((item) => item.chartScope.startDate.getDate() === new Date('2024-02-12').getDate()) as FetchWeeklyChartResult;
    expect(result.length).toBe(2);
    expect(chartScope2M2W.startDate.getTime() === new Date('2024-02-05').getDate());
    expect(chartScope2M3W.startDate.getTime() === new Date('2024-02-12').getDate());
    expect.assertions(3);
  });
});

describe('func fetchAdditionalInformationOfTrack', () => {
  it('This function can fetch the releaseDate,trackImage and lyrics.', async () => {
    const { releaseDate, trackImage, lyrics } = await genie.fetchAddInfoOfTrack('103151984', '84181610');
    const urlPattern = /^https?:\/\/[\w-]+(\.[\w-]+)+\/[\w-\\/]+\.JPG(\/[\w-]+\/[\w-]+\/[\w-]+,[\w-]+)?$/;
    const isURL = urlPattern.test(trackImage);
    expect(releaseDate.getTime()).toBe(new Date('2023-08-21').getTime());
    expect(isURL).toBe(true);
    expect(lyrics.length > 100).toBe(true);
    expect.assertions(3);
  });
});

describe('Test ArtistInfo function', () => {
  it('ArtistInfo function', async () => {
    const result = await genie.fetchAddInfoOArtist('82007551');
    expect(typeof (result.artistImage)).toBe('string');
    expect(typeof (result.debut)).toBe('string');
  });
});
