import useDebounce from './useDebounce';
import useSWRInfinite from 'swr/infinite';
import { findArtists } from '@utils/\bswrFetcher';

interface Prob{
query:string
}

export function useFindArtists({ query }:Prob) {
  const debouncedQuery = useDebounce(query, 100);
  const {
    data: artistData,
    error: artistError,
    isLoading: artistIsLoading,
    size: artistSize,
    setSize: setArtistSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (previousPageData && previousPageData.length === 0) return null; // 마지막 페이지에 도달 시 요청 중지
      if (query.length === 0) return null;
      const offset = pageIndex * 5; // offset 계산
      return debouncedQuery ? ['artists', debouncedQuery, offset] : null;
    },
    ([, query, offset]) => findArtists(query, offset),
    {
      revalidateOnFocus: false, // 페이지로 돌아오거나 브라우저 탭을 다시 포커스할 때 현재 캐시된 데이터를 그대로 사용
      dedupingInterval: 300_000, // 5분간 동일한 key에대해 재요청 x
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
