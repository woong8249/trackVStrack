/* eslint-disable no-unused-vars */
import type {
  ArtistAddInfo,
  FetchDailyChartResult,
  FetchMonthlyChartResult,
  FetchWeeklyChartResult,
  TrackAddInfo,
} from './fetch';
import type { ChartType, PlatformName } from './common';

export interface PlatformModule {
  readonly platformName: PlatformName;
  fetchChart(
    year: string,
    month: string,
    day: string,
    chartType: ChartType,
  ): Promise<
    FetchMonthlyChartResult | FetchWeeklyChartResult | FetchDailyChartResult
  >;
  fetchChartsInParallel(
    startDate: Date,
    endDate: Date,
    chartType: ChartType,
    chunkSize: number,
  ): Promise<
    | FetchMonthlyChartResult[]
    | FetchWeeklyChartResult[]
    | FetchDailyChartResult[]
  >;
  fetchAddInfoOfTrack(trackID: string, albumID?: string): Promise<TrackAddInfo>;
  fetchAddInfoOfArtist(artistID: string): Promise<ArtistAddInfo>;
}
