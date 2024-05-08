/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import { expect, it } from 'vitest';

import { getItemsWithSameKeyword } from '../src/dataCollecting/domestic/integrate';
import jsonFile20191230_20210103 from '../src/dataCollecting/domestic/dataAfterIntegration/20191230-20210103-w.json';
import jsonFile20210104_20220102 from '../src/dataCollecting/domestic/dataAfterIntegration/20210104-20220102-w.json';
import jsonFile20220103_20230101 from '../src/dataCollecting/domestic/dataAfterIntegration/20220103-20230101-w.json';
import jsonFile20230102_20231231 from '../src/dataCollecting/domestic/dataAfterIntegration/20230102-20231231-w.json';
import redisKeys from '../config/redisKey';
import winLogger from '../src/util/winston';

const { trackList } = redisKeys;

it('If the subFix of trackKey is different, the artistKey will be different.', async () => {
  const jsonFiles = [
    jsonFile20191230_20210103,
    jsonFile20210104_20220102,
    jsonFile20220103_20230101,
    jsonFile20230102_20231231,
  ];
  const tracksWithSubFixOverZeroArray = jsonFiles.map(file => {
    const tracksWithSubFixOverZero = Object.entries(file).filter(([key]) => {
      if (key.split('/')[2] > 0) {
        return true;
      }
      return false;
    });
    return tracksWithSubFixOverZero;
  });
  let allCount = 1;
  for (const tracks of tracksWithSubFixOverZeroArray) {
    for await (const [_key, value] of tracks) {
      const { titleKeyword } = value;
      const tracksWithSameKeyword = await getItemsWithSameKeyword(trackList, titleKeyword);
      const representativeArtists = tracksWithSameKeyword.map(track => track.artistKey);
      const uniqueElements = new Set();
      representativeArtists.forEach(element => {
        if (uniqueElements.has(element)) {
          winLogger.error('check', representativeArtists, element, titleKeyword, value);
        }
        expect(uniqueElements.has(element)).toBe(false);
        uniqueElements.add(element);
      });
      expect(uniqueElements.size).toBe(representativeArtists.length);
      allCount += (representativeArtists.length + 1);
    }
  }
  expect(allCount > 2).toBe(true);
  expect.assertions(allCount);
}, 30_00);
