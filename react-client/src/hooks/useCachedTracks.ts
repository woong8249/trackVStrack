import { TrackWithArtistResponse } from '@typings/track';
import { trackEndpoints, fetcher } from '@utils/axios';
import useSWR from 'swr';

import { SelectedTrack } from '@pages/ExplorePage';
import { AxiosError } from 'axios';

export function useCachedTracks(selectedTracks: Omit<SelectedTrack, 'activate'>[]) {
  // URLs 생성
  const notCallCondition = selectedTracks.every((selectedTrack) => (selectedTrack.track as TrackWithArtistResponse)?.titleName);
  const urls = selectedTracks.map((selectTrack) => {
    const trackId = (selectTrack.track as TrackWithArtistResponse)?.id ?? null;
    return trackId ? trackEndpoints.getTrackById(Number(trackId), { withArtists: true }) : null;
  });

  // SWR 호출

  const arg = urls.length > 0 ? urls : null;
  const { data, error, isLoading } = useSWR(
    arg,
    async (urls: (string | null)[]) => {
      if (notCallCondition) {
        return null;
      }
      const result = await Promise.all(
        urls.map((url) => (url ? fetcher<TrackWithArtistResponse>(url) : Promise.resolve(null))),
      );

      return result;
    },
  );
  if (notCallCondition) {
    return {
      data: selectedTracks.map((selectedTrack) => selectedTrack.track as TrackWithArtistResponse),
      isLoading: false,
      error: null,
    };
  }

  return {
    data,
    isLoading,
    error,
  } as {data:(TrackWithArtistResponse|null)[], isLoading:boolean, error:AxiosError};
}
