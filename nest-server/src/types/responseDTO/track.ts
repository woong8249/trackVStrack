import { WeeklyChartScope } from '../db/fetch';

export type ArtistResponse = {
  id: number;
  artistName: string;
  artistImage: string | null;
  debut: string | null;
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
