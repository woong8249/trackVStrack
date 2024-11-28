import axios from 'axios';
import config from '@config/config';

export interface FindDTO {
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

const { baseURL } = config;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get((url));
  return response.data;
};

export const trackEndpoints = {
  getTracks: (params: FindWithChartDurationDTO) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return `/tracks?${queryString}`;
  },
  getTrackById: (id: number, params?: { withArtists: boolean }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return `/tracks/${id}${queryString}`;
  },
};

export const artistEndpoints = {
  getArtists: (params: FindDTO) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return `/artists?${queryString}`;
  },
  getArtistById: (id: number, params?: { withTracks: boolean }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return `/artists/${id}${queryString}`;
  },
};
