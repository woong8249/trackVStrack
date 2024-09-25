import type { WeeklyChartScope } from 'src/types/fetch';
import type { Platform, TrackFormatWithoutAddInfo } from '../types/processing';
import type { PlatformName } from 'src/types/common';

// 일단은 week 기준으로
export function groupDuplicateTracksByPlatform(
  tracksOrTrack: TrackFormatWithoutAddInfo|TrackFormatWithoutAddInfo[],
): TrackFormatWithoutAddInfo | TrackFormatWithoutAddInfo[] {
  const tracks = Array.isArray(tracksOrTrack) ? tracksOrTrack : [tracksOrTrack];
  const result: TrackFormatWithoutAddInfo[] = [];

  tracks.forEach((track) => {
    const platformName = Object.keys(track).find((key) => key !== 'trackKeyword' && key) as PlatformName;
    const platform = track.melon || track.genie || track.bugs as Platform;
    const curTrackID = platform.trackID;
    const targetTrack = result.find(
      (resultTrack) => (resultTrack[platformName] as Platform).trackID === curTrackID,
    );
    if (targetTrack) {
      (targetTrack[platformName] as Platform).weeklyChartScope.push(
        (track[platformName] as Platform).weeklyChartScope[0] as WeeklyChartScope & { rank: string },
      );
    } else {
      result.push(track);
    }
  });
  return Array.isArray(tracksOrTrack) ? result : result[0] as TrackFormatWithoutAddInfo;
}

// export function groupDuplicateTracksAcrossPlatforms(tracks:TrackFormat[]) {
//   const result: TrackFormat[] = [];
// }
