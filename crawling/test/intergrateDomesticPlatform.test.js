/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */

import {
  describe,
  expect, it,
} from 'vitest';

import * as bugs from '../src/dataCollecting/domestic/bugs.js';
import * as genie from '../src/dataCollecting/domestic/genie.js';
import * as melon from '../src/dataCollecting/domestic/melon.js';
import { integrateDomesticPlatformChart, mappingChartDataToTrack } from '../src/dataCollecting/domestic/integrate.js';
import redisClient from '../src/redis/redisClient.js';
// import flushAllRedisData from '../src/redis/flushAllRedisData.js';

import { checkForDuplicates } from './util.js';

const modules = [melon, genie, bugs];
describe('Test func mappingChartDataToTrack', async () => {
  const promises = modules.map(ite => ite.fetchChart('2023', '10', '16', 'w'));
  const result = await Promise.all(promises);
  const mappingTracks = result.reduce((pre, cur) => {
    const mappingTrack = mappingChartDataToTrack(cur);
    pre.push(mappingTrack);
    return pre;
  }, []).flat();
  it('No duplicate artistKeyword and titleKeyword combinations in Melon', () => {
    expect(checkForDuplicates(mappingTracks, 'melon')).toBe(true);
  });

  it('No duplicate artistKeyword and titleKeyword combinations in Genie', () => {
    expect(checkForDuplicates(mappingTracks, 'genie')).toBe(true);
  });

  it('No duplicate artistKeyword and titleKeyword combinations in Bugs', () => {
    expect(checkForDuplicates(mappingTracks, 'bugs')).toBe(true);
  });
});

describe('function integrateDomesticPlatformChart', () => {
  it('Chart information will not be duplicated in the Redis hash.', async () => {
    // await flushAllRedisData();
    await integrateDomesticPlatformChart(new Date('2023-01-02'), new Date('2023-06-25'), 'w');
    const trackNamedSpicy = await redisClient.hGetAll('Spicy/0');
    const platformsOfSpicy = JSON.parse(trackNamedSpicy.platforms);
    const platformsListOfSpicy = Object.keys(platformsOfSpicy);
    expect(platformsListOfSpicy.length).toBe(3);
    console.log(platformsOfSpicy, trackNamedSpicy);
  }, 50000);
});
