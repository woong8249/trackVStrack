/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */

import {
  describe,
  expect, it,
} from 'vitest';

import * as bugs from '../src/dataCollecting/domestic/bugs.js';
import * as genie from '../src/dataCollecting/domestic/genie.js';
import * as melon from '../src/dataCollecting/domestic/melon.js';
import {
  // fetchReleaseDateAndImageInParallel, getAllTrackFromRedis,
  integrateDomesticPlatformChart, mappingChartDataToTrack,
} from '../src/dataCollecting/domestic/integrate.js';
// import flushAllRedisData from '../src/redis/flushAllRedisData.js';
import redisClient from '../src/redis/redisClient.js';
// import { parseJSONProperties } from '../src/util/json.js';

import { checkForDuplicates } from './util.js';

const modules = [melon, genie, bugs];
describe('Test func mappingChartDataToTrack', async () => {
  const promises = modules.map(ite => ite.fetchChart('2023', '10', '16', 'w'));
  const result = await Promise.all(promises);
  // console.dir(result, { depth: 100 });
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
    await integrateDomesticPlatformChart(new Date('2023-01-02'), new Date('2023-01-08'), 'w');
    const trackNamedDitto = await redisClient.hGetAll('Ditto/0');
    const platformsOfDitto = JSON.parse(trackNamedDitto.platforms);
    const platformsListOfDitto = Object.keys(platformsOfDitto);
    expect(platformsListOfDitto.length).toBe(3);
  }, 50000);
});

//  레디스 데이터를 날리기때문에 주석 걸어놨습니다.
// it('All processes to integrate charts on all domestic platforms', async () => {
//   await flushAllRedisData();
//   await integrateDomesticPlatformChart(new Date('2023-01-02'), new Date('2023-01-08'), 'w');
//   const tracks = await getAllTrackFromRedis();
//   const someTrack = tracks[0];
//   expect(someTrack).toHaveProperty('title');
//   expect(someTrack).toHaveProperty('titleKeyword');
//   expect(someTrack).toHaveProperty('artists');
//   expect(someTrack).toHaveProperty('artistKeywords');
//   expect(someTrack).toHaveProperty('platforms');
//   expect(someTrack).toHaveProperty('thumbnails');

//   const result = await fetchReleaseDateAndImageInParallel(tracks);
//   const tracksAddedRelDateAndImg = (await getAllTrackFromRedis());
//   expect(tracksAddedRelDateAndImg[0]).toHaveProperty('title');
//   expect(tracksAddedRelDateAndImg[0]).toHaveProperty('titleKeyword');
//   expect(tracksAddedRelDateAndImg[0]).toHaveProperty('artists');
//   expect(tracksAddedRelDateAndImg[0]).toHaveProperty('artistKeywords');
//   expect(tracksAddedRelDateAndImg[0]).toHaveProperty('thumbnails');
//   expect(tracksAddedRelDateAndImg[0]).toHaveProperty('platforms');
//   expect(tracksAddedRelDateAndImg[0]).toHaveProperty('releaseDate');
//   expect(tracksAddedRelDateAndImg[0]).toHaveProperty('trackImage');
//   expect.assertions(14);
//   console.dir(result, { depth: 100 });
// }, 50000);

// const tracks = parseJSONProperties(await getAllTrackFromRedis());
// console.dir(tracks.find(({ titleKeyword }) => titleKeyword === 'Love Lee'), { depth: 100 });
