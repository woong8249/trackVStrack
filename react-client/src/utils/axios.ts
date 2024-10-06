import axios from 'axios';
import { ArtistResponse } from '@typings/artist';
import { TrackWithArtistResponse } from '@typings/track-artist';
import { TrackResponse } from '@typings/track';

interface FindDTO {
  limit?: number;
  offset?: number;
  sort?: 'asc' | 'desc'|'random';
  query?: string;
}
export interface FindWithChartDurationDTO extends FindDTO {
  minWeeksOnChart?: number;
  random?: boolean
}

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tracksApi = {
  async getTrackById(id: number): Promise<TrackResponse|null> {
    return (await apiClient.get(`/tracks/${id}`)).data;
  },

  async getTracks(params: FindWithChartDurationDTO): Promise<TrackResponse[]|[]> {
    return (await apiClient.get('/tracks', { params })).data;
  },
};

export const artistsApi = {
  async getArtistById(id: number): Promise<ArtistResponse|null> {
    return (await apiClient.get(`/artists/${id}`)).data;
  },
  async getArtists(params: FindDTO): Promise<ArtistResponse[]|[]> {
    return (await apiClient.get('/artists', { params })).data;
  },
};

export const trackWithArtistApi = {
  async getTracksWithArtistById(id: number): Promise<TrackWithArtistResponse|null> {
    return (await apiClient.get(`/tracks-artists/${id}`)).data;
  },

  async getTracksWithArtist(params: FindWithChartDurationDTO):
   Promise<TrackWithArtistResponse[]|[]> {
    return (await apiClient.get('/tracks-artists', { params })).data;
  },
};
