import axios from 'axios';

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

export const fetcher = async <T>
(url: string, params?: FindDTO | FindWithChartDurationDTO): Promise<T> => {
  const response = await apiClient.get(url, { params });
  return response.data;
};

export const trackEndpoints = {
  getTracks: (params: FindWithChartDurationDTO) => ['/tracks', params] as [string, FindWithChartDurationDTO],
  getTrackById: (id: number, params?: { withArtists: boolean }) => [`/tracks/${id}`, params] as [string, { withArtists: boolean }],
};

export const artistEndpoints = {
  getArtists: (params: FindDTO) => ['/artists', params] as [string, FindDTO],
  getArtistById: (id: number, params?: { withTracks: boolean }) => [`/artists/${id}`, params] as [string, { withTracks: boolean }],
};
