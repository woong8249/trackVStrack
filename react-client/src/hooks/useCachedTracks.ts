import { TrackWithArtistResponse } from '@typings/track';
import { trackEndpoints, fetcher } from '@utils/axios';
import useSWR from 'swr';
import { AxiosError } from 'axios';
import { SelectedTrack, Track } from '@pages/ExplorePage';

export function useCachedTracks(selectedTracks: SelectedTrack[]) {
  // URLs 생성
  const urls = selectedTracks.map((selectTrack) => {
    const trackId = (selectTrack.track as TrackWithArtistResponse)?.id ?? null;
    return trackId ? trackEndpoints.getTrackById(Number(trackId), { withArtists: true }) : null;
  });

  // SWR 호출
  const { data, error, isLoading } = useSWR(
    urls.length > 0 ? urls : null,
    async (urls: (string | null)[]) => Promise.all(
      urls.map((url) => (url ? fetcher<TrackWithArtistResponse>(url) : Promise.resolve(null))),
    ),
  );

  // 결과 매핑
  const result = data
    ? selectedTracks.map((item, index) => ({
      ...item,
      track: data[index] as Track,
    }))
    : [];

  return {
    selectedTracks: result,
    isLoading,
    error,
  } as { selectedTracks: SelectedTrack[]; error: AxiosError | undefined; isLoading: boolean };
}
