// src/types/track.ts
export interface Artist {
  id: number;
  artistName: string;
  artistImage: string | null;
  debut: string | null;
}

export interface ChartInfo {
  rank: string;
  chartType: string;
  startDate: string;
  endDate: string;
  weekOfMonth: {
    year: number;
    month: number;
    week: number;
  };
}

export interface Platform {
  chartInfos: ChartInfo[];
  trackInfo: {
    title: string;
    trackID: string;
    albumID: string | null;
  };
}

export interface Track {
  id: number;
  titleName: string;
  releaseDate: string;
  trackImage: string;
  platforms: {
    melon?: Platform; // melon을 선택적으로 정의
    genie?: Platform;
    bugs?: Platform;
  };
  lyrics: string;
  artists: Artist[];
}

export interface TrackShortInfo {
  id: number;
  titleName: string;
  releaseDate: string | null;
  trackImage: string;
  artists: Omit<Artist, 'debut,artistImage'>[];
}
