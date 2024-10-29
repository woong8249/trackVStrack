import { tracksApi } from '@utils/axios';
import useDebounce from '@hooks/useDebounce';
import useSWRInfinite from 'swr/infinite';
import { TrackWithArtistResponse } from '@typings/track';

async function findTracks(query: string, offset: number) {
  return await tracksApi.getTracks({
    sort: 'desc',
    offset,
    limit: 5,
    query: query.replace(/\s+/g, ''),
    withArtists: true,
  }) as TrackWithArtistResponse[];
}

export function useFindTracks(query:string) {
  const debouncedQuery = useDebounce(query, 100);
  // 트랙 데이터 관리
  const {
    data: trackData,
    error: trackError,
    isLoading: trackIsLoading,
    size: trackSize,
    setSize: setTrackSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData && previousPageData.length === 0) return null; // 마지막 페이지에 도달 시 요청 중지
      if (query.length === 0) return null;
      const offset = pageIndex * 5; // offset 계산
      return debouncedQuery ? ['tracks', debouncedQuery, offset] : null;
    },
    ([, query, offset]) => findTracks(query, offset),
    { revalidateOnFocus: false, dedupingInterval: 300_000 },
  );

  async function loadMoreTracks() {
    const newSize = trackSize + 1;
    setTrackSize(newSize);
  }

  return {
    loadMoreTracks, trackData, trackError, trackIsLoading, setTrackSize,
  };
}
