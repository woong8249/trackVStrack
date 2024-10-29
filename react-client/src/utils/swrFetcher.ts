import { TrackWithArtistResponse } from '@typings/track';
import { artistsApi, tracksApi } from './axios';
import { ArtistResponse } from '@typings/artist';

export async function findTracks(query: string, offset: number) {
  return await tracksApi.getTracks({
    sort: 'desc',
    offset,
    limit: 5,
    query: query.replace(/\s+/g, ''),
    withArtists: true,
  }) as TrackWithArtistResponse[];
}

export async function findArtists(query: string, offset: number) {
  return await artistsApi.getArtists({
    sort: 'desc',
    offset,
    limit: 5,
    query: query.replace(/\s+/g, ''),
  }) as ArtistResponse[];
}
