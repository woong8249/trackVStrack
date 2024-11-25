import { Platform, TrackWithArtistResponse } from '@typings/track';

// 단일 트랙 날짜 범위 계산
export function getTrackDateRange(track:TrackWithArtistResponse): { startDate: Date; endDate: Date } {
  const { platforms } = track;
  const availablePlatforms = [platforms?.bugs, platforms?.genie, platforms?.melon].filter(Boolean) as Platform[];

  const startDates = availablePlatforms
    .flatMap((platform) => platform.weeklyChartScope.map((scope) => scope.startDate))
    .filter(Boolean)
    .map((date) => new Date(date).getTime());

  const endDates = availablePlatforms
    .flatMap((platform) => platform.weeklyChartScope.map((scope) => scope.endDate))
    .filter(Boolean)
    .map((date) => new Date(date).getTime());

  return {
    startDate: new Date(Math.min(...startDates)),
    endDate: new Date(Math.max(...endDates)),
  };
}

// 다중 트랙 날짜 범위 계산
export function mergeTracksDateRange(tracks:TrackWithArtistResponse[]): { startDate: Date; endDate: Date } {
  const allStartDates: number[] = [];
  const allEndDates: number[] = [];

  tracks.forEach((track) => {
    const { startDate, endDate } = getTrackDateRange(track);
    allStartDates.push(startDate.getTime());
    allEndDates.push(endDate.getTime());
  });

  return {
    startDate: new Date(Math.min(...allStartDates)),
    endDate: new Date(Math.max(...allEndDates)),
  };
}
