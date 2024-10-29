import { useState } from 'react';
import useDebounce from './useDebounce';
import useSWRInfinite from 'swr/infinite';
import { findTracks } from '@utils/\bswrFetcher';

export function useFindTrack() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
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
      const offset = pageIndex * 5; // offset 계산
      return debouncedQuery ? ['tracks', debouncedQuery, offset] : null;
    },
    ([, query, offset]) => findTracks(query, offset),
    { revalidateOnFocus: false },
  );

  async function loadMoreTracks() {
    const newSize = trackSize + 1;
    setTrackSize(newSize);
  }

  return {
    setQuery, loadMoreTracks, trackData, trackError, trackIsLoading, setTrackSize, query,
  };
}
