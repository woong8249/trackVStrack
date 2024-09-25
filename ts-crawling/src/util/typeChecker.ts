import type { ChartDetail, Track, Artist } from '../types/fetch';
import winLogger from '../logger/winston';

export function isTrack(value: unknown): value is Track {
  // 먼저 value가 객체인지 확인
  if (typeof value === 'object' && value !== null) {
    return typeof (value as Track).rank === 'string'
          && typeof (value as Track).titleName === 'string'
          && typeof (value as Track).titleKeyword === 'string'
          && typeof (value as Track).trackID === 'string';
  }
  return false;
}

export function isArtist(value: unknown): value is Artist {
  return typeof value === 'object' && value !== null
      && typeof (value as Artist).artistName === 'string'
      && typeof (value as Artist).artistKeyword === 'string'
      && typeof (value as Artist).artistID === 'string';
}

export function isChartDetail(value: unknown): value is ChartDetail {
  return typeof value === 'object' && value !== null
        && isTrack(value)
        && Array.isArray((value as ChartDetail).artists)
        && (value as ChartDetail).artists.every(isArtist);
}

export function validateChartDetails(chartDetails: unknown[]): asserts chartDetails is ChartDetail[] {
  if (!Array.isArray(chartDetails)) {
    winLogger.error('Expected an array, but received:', chartDetails);
    // throw new Error('Return value is not an array');
  }

  const invalidDetails: { index: number; detail: unknown }[] = [];

  chartDetails.forEach((detail, index) => {
    if (!isChartDetail(detail)) {
      invalidDetails.push({ index, detail });
    }
  });

  if (invalidDetails.length > 0) {
    invalidDetails.forEach(({ index, detail }) => {
      winLogger.error(`Chart detail at index ${index.toString()} does not match expected type:`, detail);
    });
    // throw new Error(`Found ${invalidDetails.length.toString()} invalid chart detail(s)`);
  }
}
