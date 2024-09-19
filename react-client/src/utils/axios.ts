import axios from 'axios';
import { Track } from 'src/types/track';

const API_BASE_URL = 'http://localhost:3000';
const axiosInstance = axios.create({ baseURL: API_BASE_URL });

export async function searchTracks(query: string) {
  try {
    const { data } = await axiosInstance.get(`/track?q=${query}`) as {data: {tracks:Track[]}};
    return data.tracks;
  } catch (error) {
    console.error('Error fetching track results:', error);
    return [];
  }
}

// async function searchArtists(query) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/artist?q=${query}`);
//     const data = await response.json();
//     console.log('Artist results:', data);
//     return data.artists;
//   } catch (error) {
//     console.error('Error fetching artist results:', error);
//     return [];
//   }
// }
