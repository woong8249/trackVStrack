import { ArtistResponse } from '../artists/artist.interface';
import { TrackResponse } from '../tracks/track.interface';

export type TrackWithArtistResponse = TrackResponse & {
  artists: ArtistResponse[];
};
