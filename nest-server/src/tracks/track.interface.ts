import { WeeklyChartScope } from 'src/database/types/fetch';

export type Platform = {
  weeklyChartScope: (WeeklyChartScope & { rank: string })[];
};

export type TrackResponse = {
  id: number;
  titleName: string;
  trackImage: string;
  releaseDate: string;
  lyrics: string;
  platforms: {
    melon?: Platform;
    genie?: Platform;
    bugs?: Platform;
  };
};
