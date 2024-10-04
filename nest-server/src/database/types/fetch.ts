import type { PlatformName } from './common';

export type WeekOfMonth = {
  year: string;
  month: string;
  week: string;
};

export type Track = {
  rank: string;
  titleName: string;
  titleKeyword: string;
  trackID: string;
  albumID?: string;
};
export type TrackAddInfo = {
  releaseDate: string;
  trackImage: string;
  lyrics: string;
};

export type Artist = {
  artistName: string;
  artistKeyword: string;
  artistID: string;
};

export type ArtistAddInfo = {
  artistImage: string;
  debut: string;
};

export type ChartDetail = Track & { artists: Artist[] };

export type DailyChartScope = {
  date: Date;
  chartType: 'd';
};

export type WeeklyChartScope = {
  startDate: Date;
  endDate: Date;
  weekOfMonth: WeekOfMonth;
  chartType: 'w';
};

export type MonthlyChartScope = {
  date: Date;
  chartType: 'm';
};

export type FetchDailyChartResult = {
  platform: PlatformName;
  chartScope: DailyChartScope;
  chartDetails: ChartDetail[];
};

export type FetchWeeklyChartResult = {
  platform: PlatformName;
  chartScope: WeeklyChartScope;
  chartDetails: ChartDetail[];
};

export type FetchMonthlyChartResult = {
  platform: PlatformName;
  chartScope: MonthlyChartScope;
  chartDetails: ChartDetail[];
};
