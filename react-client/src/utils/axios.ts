import axios from 'axios';
import { ArtistResponse, ArtistWithTracksResponse } from '@typings/artist';
import { TrackResponse, TrackWithArtistResponse } from '@typings/track';

interface FindDTO {
  limit?: number;
  offset?: number;
  sort?: 'asc' | 'desc'| 'random';
  query?: string;
  withArtists?: boolean;
  withTracks?: boolean;
}

export interface FindWithChartDurationDTO extends FindDTO {
  minWeeksOnChart?: number;
}

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tracksApi = {
  async getTrackById(id: number, params?:{withArtists: boolean;}):
   Promise<TrackResponse |TrackWithArtistResponse > {
    return (await apiClient.get(`/tracks/${id}`, { params })).data;
  },

  async getTracks(params: FindWithChartDurationDTO):
   Promise<TrackResponse[] |TrackWithArtistResponse[]| []> {
    return (await apiClient.get('/tracks', { params })).data;
  },
};

export const artistsApi = {
  async getArtistById(id: number, params?:{withTracks: boolean;}):
   Promise<ArtistResponse|ArtistWithTracksResponse> {
    return (await apiClient.get(`/artists/${id}`, { params })).data;
  },

  async getArtists(params: FindDTO): Promise<ArtistResponse[] |ArtistWithTracksResponse[]| []> {
    return (await apiClient.get('/artists', { params })).data;
  },
};
