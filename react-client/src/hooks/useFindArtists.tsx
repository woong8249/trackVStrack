import useDebounce from '@hooks/useDebounce';
import useSWRInfinite from 'swr/infinite';
import { artistEndpoints } from '@utils/axios';

export function useFindArtists(query :string) {
  const debouncedQuery = useDebounce(query, 100);
  const {
    data: artistData,
    error: artistError,
    isLoading: artistIsLoading,
    size: artistSize,
    setSize: setArtistSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (!debouncedQuery || previousPageData?.length === 0) return null;
      const offset = pageIndex * 5;
      const [url, params] = artistEndpoints.getArtists({
        sort: 'desc', offset, limit: 5, query: debouncedQuery, withTracks: false,
      });
      return [url, params];
    },
  );

  async function loadMoreArtists() {
    const newSize = artistSize + 1;
    setArtistSize(newSize);
  }

  return {
    artistData, artistError, artistIsLoading, setArtistSize, loadMoreArtists,
  };
}
