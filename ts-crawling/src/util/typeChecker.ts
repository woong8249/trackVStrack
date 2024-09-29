import type {
  ChartDetail, Track, Artist, TrackAddInfo,
  ArtistAddInfo,
} from '../types/fetch';
import winLogger from '../logger/winston';
import type { PlatformName } from 'src/types/common';

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
  }
}

export function checkFetchAddInfoOfTrack({
  trackID,
  lyrics,
  trackImage,
  releaseDate,
  url,
}:TrackAddInfo &{trackID:string, url:string}, platformName:PlatformName):void {
  const fields = {
    trackID,
    lyrics,
    trackImage,
    releaseDate,
    url,
  };
  const missingFiled = Object.fromEntries(Object.entries(fields).filter(([_key, value]) => value === 'missing'));

  if (lyrics === 'missing' || trackImage === 'missing') {
    winLogger.error(`Missing required track information in ${platformName}`, {
      ...missingFiled,
      url,
    });
  }
}

export function checkFetchAddInfoOfArtist({
  artistImage,
  debut,
  url,
  artistID,
}:ArtistAddInfo&{artistID:string, url:string}, platformName:PlatformName):void {
  const fields = {
    artistImage,
    debut,
    url,
    artistID,
  };
  const missingFiled = Object.fromEntries(Object.entries(fields).filter(([_key, value]) => value === 'missing'));

  if (artistImage === 'missing') {
    winLogger.error(`Missing required artist information in ${platformName}`, {
      ...missingFiled,
      url,
    });
  }
}

export function validateCommand(command:string | undefined) {
  if (!command) {
    throw new Error('Invalid');
  }
  const validCommand = ['fetch', 'insert'];
  if (!validCommand.includes(command)) {
    throw new Error('Invalid command');
  }
  return command;
}

export function validateDate(dateString:string | undefined) {
  if (!dateString) {
    throw new Error('Invalid');
  }
  const regex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD 포맷 검사
  if (!regex.test(dateString)) {
    throw new Error('Date format must be YYYY-MM-DD');
  }
  const date = new Date(dateString);
  if (date.toString() === 'Invalid Date') {
    throw new Error('Invalid date provided');
  }
  return date;
}
