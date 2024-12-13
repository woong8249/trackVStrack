import { TrackWithArtistResponse } from '@typings/track';
import { trackEndpoints } from '@utils/axios';
import useSWR from 'swr';

export function useCachedTrack(track: TrackWithArtistResponse |{id:number} | null) {
  const notCallCondition = (track as TrackWithArtistResponse)?.titleName;
  const trackId = track?.id ? Number(track.id) : null;
  const { data: trackByIdData, isLoading } = useSWR(
    () => {
      if (!trackId) return null;
      if (notCallCondition) {
        return null;
      }
      return trackEndpoints.getTrackById(trackId, { withArtists: true });
    },
  );
  if (notCallCondition) return track as TrackWithArtistResponse;
  if (isLoading && (track as TrackWithArtistResponse).titleName) {
    return track as TrackWithArtistResponse;
  }

  if (trackByIdData) {
    return trackByIdData as TrackWithArtistResponse;
  }

  return null;
}
