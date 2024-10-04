import { ArtistResponse } from '@typings/artist';
import { TrackResponse } from '@typings/track';

export type TrackWithArtistResponse = TrackResponse & {
  artists: ArtistResponse[];
};
