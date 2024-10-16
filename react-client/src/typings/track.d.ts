import { ArtistResponse } from '@typings/artist';

export type WeeklyChartScope = {
  startDate: string;
  endDate: string;
  weekOfMonth: {
    year: string;
    month: string;
    week: string;
  };
  chartType: 'w';
};

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

export type TrackWithArtistResponse = TrackResponse & {
  artists: ArtistResponse[];
};
