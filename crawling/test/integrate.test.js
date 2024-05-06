/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import { expect, it } from 'vitest';

import { getItemsWithSameKeyword } from '../src/dataCollecting/domestic/integrate';
import jsonFile20230102_20231231 from '../src/dataCollecting/domestic/dataAfterIntegration/20230102-20231231-w.json';
import redisKeys from '../config/redisKey';

const { trackList } = redisKeys;

// JSON파일들을 계속 추가할 것임
it('If the subFix of trackKey is different, the artistKey will be different.', async () => {
  const tracksWithSubFixOverZero = Object.entries(jsonFile20230102_20231231).filter(([key]) => {
    if (key.split('/')[2] > 0) {
      return true;
    }
    return false;
  });
  let allCount = 1;
  for await (const [_key, value] of tracksWithSubFixOverZero) {
    const { titleKeyword } = value;
    const tracksWithSameKeyword = await getItemsWithSameKeyword(trackList, titleKeyword);
    const representativeArtists = tracksWithSameKeyword.map(track => track.artistKey);
    const uniqueElements = new Set();
    representativeArtists.forEach(element => {
      expect(uniqueElements.has(element)).toBe(false);
      uniqueElements.add(element);
    });

    expect(uniqueElements.size).toBe(representativeArtists.length);
    allCount += (representativeArtists.length + 1);
  }
  expect(allCount > 2).toBe(true);
  expect.assertions(allCount);
});
