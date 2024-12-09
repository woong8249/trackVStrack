import { PlatformName } from '@constants/platform';
import { TrackWithArtistResponse } from '@typings/track';

export function calculatePlatformScore(track: TrackWithArtistResponse, platformName: PlatformName, startDate:Date, endDate:Date) {
  const platform = track.platforms[platformName];
  if (!platform) return 0;

  return platform.weeklyChartScope.reduce((acc, scope) => {
    const scopeStartDate = new Date(scope.startDate);
    const scopeEndDate = new Date(scope.endDate);

    // 주어진 기간 내의 점수만 계산
    if (scopeStartDate >= startDate && scopeEndDate <= endDate) {
      return acc + (101 - Number(scope.rank));
    }
    return acc;
  }, 0);
}

export interface PlatformScore {
  platform: PlatformName;
  score: number;
}

export interface TrackScore {
  platformScores: PlatformScore[];
  totalScore: number;
}

export function calculateTrackScore(
  track: TrackWithArtistResponse,
  startDate: Date,
  endDate: Date,
): TrackScore {
  const platformNames: PlatformName[] = ['melon', 'genie', 'bugs'];

  // 각 플랫폼의 점수 계산
  const platformScores: PlatformScore[] = platformNames.map((platformName) => ({
    platform: platformName,
    score: calculatePlatformScore(track, platformName, startDate, endDate),
  }));

  // 총 점수 계산
  const totalScore = platformScores.reduce((acc, platformScore) => acc + platformScore.score, 0);

  return {
    platformScores,
    totalScore,
  };
}
