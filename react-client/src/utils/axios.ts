import axios, { AxiosResponse } from 'axios';
import { ArtistResponse } from '@typings/artist';
import { TrackWithArtistResponse } from '@typings/track-artist';
import { TrackResponse } from '@typings/track';

interface PaginatedRequest {
  limit?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
  query?: string;
}

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tracksApi = {
  async getTrackById(id: number): Promise<AxiosResponse<TrackResponse|null>> {
    return (await apiClient.get(`/tracks/${id}`)).data;
  },

  async getTracks(params: PaginatedRequest): Promise<AxiosResponse<TrackResponse[]|[]>> {
    return (await apiClient.get('/tracks', { params })).data;
  },
};

export const artistsApi = {
  async getArtistById(id: number): Promise<AxiosResponse<ArtistResponse|null>> {
    return (await apiClient.get(`/artists/${id}`)).data;
  },
  async getArtists(params: PaginatedRequest): Promise<AxiosResponse<ArtistResponse[]|[]>> {
    return (await apiClient.get('/artists', { params })).data;
  },
};

export const trackWithArtistApi = {
  async getTracksWithArtistById(id: number): Promise<AxiosResponse<TrackWithArtistResponse|null>> {
    return (await apiClient.get(`/tracks_artists/${id}`)).data;
  },

  async getTracksWithArtist(params: PaginatedRequest): Promise<TrackWithArtistResponse[]|[]> {
    return (await apiClient.get('/tracks_artists', { params })).data;
  },
};
