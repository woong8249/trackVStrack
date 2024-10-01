import melon from '../platforms/melon';
import bugs from '../platforms/bugs';
import genie from '../platforms/genie';
import type { ArtistAddInfo, FetchWeeklyChartResult, TrackAddInfo } from '../types/fetch';
import winLogger from '../logger/winston';
import { convertWeeklyChartToTrackFormat } from '../processing/format';
import { groupDuplicateTracksByPlatform } from '..//processing/merge';
import type { Platform, TrackFormatWithAddInfo, TrackFormatWithoutAddInfo } from '../types/processing';
import type { PlatformName } from '../types/common';

const modules = { bugs, melon, genie };

export async function fetchWeeklyCharts(startDate: Date, endDate: Date) {
  winLogger.info('Start chart crawling and classification', { startDate, endDate, chartType: 'w' });
  const groupedTracksByPlatformsPromiseArray = Object.entries(modules)
    .map(async ([_key, value]) => (value.fetchChartsInParallel(startDate, endDate, 'w') as Promise<FetchWeeklyChartResult[]>)
      .then((result: FetchWeeklyChartResult[]) => groupDuplicateTracksByPlatform(convertWeeklyChartToTrackFormat(result))));
  const groupedTracksByPlatforms = await Promise.all(groupedTracksByPlatformsPromiseArray) as TrackFormatWithoutAddInfo[][];

  winLogger.info('Start track classification and additional information request');
  const result = await Promise.all(
    (groupedTracksByPlatforms).map(async (array) => Promise.all(array.map(async (track) => {
      const platformName = Object.keys(track).find((key) => key !== 'trackKeyword') as PlatformName;
      const {
        trackID, albumID, artists, ...rest
      } = track[platformName] as Platform;
      const trackAddInfo = await modules[platformName].fetchAddInfoOfTrack(trackID, albumID as string) as TrackAddInfo;
      const artistWhitAddInfo = await Promise.all(
        artists.map(async (artist) => {
          const artistAddInfo = await modules[platformName].fetchAddInfoOfArtist(artist.artistID) as ArtistAddInfo;
          return Object.assign(artist, artistAddInfo);
        }),
      );
      const platformDataWhitAddInfo: TrackFormatWithAddInfo = {
        trackKeyword: track.trackKeyword,
        [platformName]: {
          ...rest,
          ...trackAddInfo,
          trackID,
          albumID,
          artists: artistWhitAddInfo,
        },
      };
      return platformDataWhitAddInfo;
    }))),
  );
  winLogger.info('Done');
  return result;
}
