import { TrackResponse } from '@typings/track';

export type ArtistResponse = {
    id: number;
    artistName: string;
    artistImage: string;
    debut: string | null;
  };

export type ArtistWithTracksResponse = ArtistResponse &{
  tracks:TrackResponse[]
}
