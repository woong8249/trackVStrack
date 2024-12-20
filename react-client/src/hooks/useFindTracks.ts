import { trackEndpoints } from '@utils/axios';
import useDebounce from '@hooks/useDebounce';
import useSWRInfinite from 'swr/infinite';

export function useFindTracks(query:string) {
  const debouncedQuery = useDebounce(query, 200);

  const {
    data: trackData,
    error: trackError,
    isLoading: trackIsLoading,
    size: trackSize,
    setSize: setTrackSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (!debouncedQuery || previousPageData?.length === 0) return null;
      const offset = pageIndex * 5;
      const url = trackEndpoints.getTracks({
        withArtists: true,
        query: debouncedQuery.replace(/\s+/g, ''),
        sort: 'desc',
        offset,
        limit: 5,
      });
      return url;
    },
  );

  async function loadMoreTracks() {
    const newSize = trackSize + 1;
    setTrackSize(newSize);
  }

  return {
    loadMoreTracks, trackData, trackError, trackIsLoading, setTrackSize,
  };
}
