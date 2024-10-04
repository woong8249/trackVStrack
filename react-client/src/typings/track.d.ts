export type WeeklyChartScope = {
  startDate: Date;
  endDate: Date;
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
