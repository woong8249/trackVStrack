import { WeeklyChartScope } from 'src/database/types/fetch';
import { ArtistResponse } from '../artists/artist.interface';

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
