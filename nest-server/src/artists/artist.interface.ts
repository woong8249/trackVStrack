import { TrackResponse } from '../tracks/track.interface';

export type ArtistResponse = {
  id: number;
  artistName: string;
  artistImage: string | null;
  debut: string | null;
};

export type ArtistWithTracksResponse = ArtistResponse & {
  tracks: TrackResponse[];
};
