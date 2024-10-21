import { tracksApi, artistsApi } from '@utils/axios';
import React, { useState, useRef, useEffect } from 'react';
import TrackInfoCard from '../TrackInfoCard';
import ArtistsInfoCard from '../ArtistsInfoCard';
import { TrackWithArtistResponse } from '@typings/track';
import ErrorAlert from '@components/ErrorAlert'; // Error 컴포넌트
import LoadingSpinner from '@components/LoadingSpinner'; // 로딩 스피너 컴포넌트
import { ArtistResponse } from '@typings/artist';
import { useModal } from '@hooks/useModal';

type Size = 100 | 80 | 70;

export default function HomeExploreBar() {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const [loading, setLoading] = useState(false); // 로딩 상태 기본값 false
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState(''); // 모달 내 검색창 상태
  const [artistList, setArtistList] = useState<ArtistResponse[]>([]);
  const [trackList, setTrackList] = useState<TrackWithArtistResponse[]>([]);
  const [additionalLoading, setAdditionalLoading] = useState(false); // 추가 요청 시 로딩 상태
  const debounceTimeoutRef = useRef<number | undefined>(undefined); // 디바운스 타이머 참조
  const [trackOffset, setTrackOffset] = useState(0); // 트랙 offset 상태
  const [artistOffset, setArtistOffset] = useState(0); // 아티스트 offset 상태
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const containerRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState<Size>(100); // 뷰포트 타입 상태

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width } = entry.contentRect;
      if (width >= 540) {
        setSize(100);
      } else if (width >= 450) {
        setSize(80);
      } else {
        setSize(70);
      }
    });

    resizeObserver.observe(container);

    // eslint-disable-next-line consistent-return
    return () => {
      resizeObserver.unobserve(container);
    };
  }, [containerRef]);

  async function search(query: string) {
    setLoading(true); // 로딩 상태 시작
    setError(null); // 이전 에러 초기화
    try {
      const trackSearchResult = await tracksApi.getTracks({
        sort: 'desc',
        offset: 0,
        limit: 5,
        query: query.replace(/\s+/g, ''),
        withArtists: true,
      }) as TrackWithArtistResponse[];

      const artistSearchResult = await artistsApi.getArtists({
        sort: 'desc',
        offset: 0,
        limit: 5,
        query: query.replace(/\s+/g, ''),
      });

      if (artistSearchResult.length > 0 || trackSearchResult.length > 0) setIsModalOpen(true);

      setTrackList(trackSearchResult);
      setArtistList(artistSearchResult);
    } catch (error) {
      setError(error as Error); // 에러 설정
    } finally {
      setLoading(false); // 로딩 상태 종료
    }
  }

  async function loadMoreTracks() {
    setAdditionalLoading(true); // 추가 로딩 상태 시작
    setError(null); // 이전 에러 초기화
    try {
      const trackSearchResult = await tracksApi.getTracks({
        sort: 'desc',
        offset: trackOffset + 5, // offset 증가
        limit: 5,
        query: query.replace(/\s+/g, ''),
        withArtists: true,
      }) as TrackWithArtistResponse[];

      if (trackSearchResult.length === 0) {
        setHasMoreTracks(false);
      } else {
        setTrackList((prev) => [...prev, ...trackSearchResult]);
        setTrackOffset((prevOffset) => prevOffset + 5);
      }
    } catch (error) {
      setError(error as Error); // 에러 설정
    } finally {
      setAdditionalLoading(false); // 추가 로딩 상태 종료
    }
  }

  async function loadMoreArtists() {
    setAdditionalLoading(true); // 추가 로딩 상태 시작
    setError(null); // 이전 에러 초기화
    try {
      const artistSearchResult = await artistsApi.getArtists({
        sort: 'desc',
        offset: artistOffset + 5, // offset 증가
        limit: 5,
        query: query.replace(/\s+/g, ''),
      });

      if (artistSearchResult.length === 0) {
        setHasMoreArtists(false);
      } else {
        setArtistList((prev) => [...prev, ...artistSearchResult]);
        setArtistOffset((prevOffset) => prevOffset + 5);
      }
    } catch (error) {
      setError(error as Error); // 에러 설정
    } finally {
      setAdditionalLoading(false); // 추가 로딩 상태 종료
    }
  }

  function handleModalInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setQuery(value);
    setTrackOffset(0);
    setArtistOffset(0);

    if (value.length === 0) {
      setTrackList([]);
      setArtistList([]);
      setIsModalOpen(false);
    }

    if (value.length > 0) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = window.setTimeout(() => {
        if (value.trim().length > 0) {
          search(value.replace(/\s+/g, ''));
        }
      }, 200);
    }
  }

  return (
    <div className="relative z-[5]" ref={containerRef}>
      <input
        type="text"
        className={`w-[380px] md:w-[450px] lg:w-[540px] h-[66px] p-8 border border-gray-300 focus:outline-none ${isModalOpen ? 'rounded-t-[40px]' : 'rounded-full'}`}
        placeholder="곡명 또는 아티스트명을 입력하세요"
        value={query}
        onChange={handleModalInput}
        onClick={(e) => {
          e.stopPropagation();
          if (query.length > 0) {
            setIsModalOpen(true);
          }
        }}
      />

      <button className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-blue-500 text-white px-8 py-2 rounded-full shadow-md hover:bg-blue-600 transition duration-300">
        탐색
      </button>

      {isModalOpen && (

        <div ref={modalRef} className="absolute top-full left-0 right-0 z-10 bg-gray-50 shadow-lg max-h-[600px] overflow-y-auto rounded-b-[40px]">
          {loading && <LoadingSpinner />}
          {error && <ErrorAlert error={error} retryFunc={() => search(query)} />}

          {trackList.length > 0 && (
          <>
            <div className="py-2 px-3 text-base text-[14px] font-semibold bg-gradient-to-b from-gray-200 to-gray-50">트랙</div>

            <ul>
              {trackList.map((track) => (
                <li key={track.id} className="px-2 hover:bg-gray-100 rounded-md border-b last:border-b-0">
                  <TrackInfoCard track={track} size={size} />
                </li>
              ))}
            </ul>

            {additionalLoading && <LoadingSpinner size={8} />}

            {hasMoreTracks && (
            <button className="w-full py-4 px-4 text-blue-500 text-sm font-semibold rounded-md hover:bg-gray-100 transition-colors" onClick={loadMoreTracks}>
              Load more tracks
            </button>
            )}
          </>
          )}

          {artistList.length > 0 && (
          <>
            <div className="py-2 px-3 text-base text-[14px] font-semibold bg-gradient-to-b from-gray-200 to-gray-50">아티스트</div>

            <ul>
              {artistList.map((artist) => (
                <li key={artist.id} className="py-2 px-2 hover:bg-gray-100 rounded-md border-b last:border-b-0">
                  <ArtistsInfoCard artist={artist} size={size} />
                </li>
              ))}
            </ul>

            {additionalLoading && <LoadingSpinner size={8} />}

            {hasMoreArtists && (
            <button className="w-full py-2 px-4 text-blue-500 text-sm font-semibold rounded-md hover:bg-gray-100 transition-colors" onClick={loadMoreArtists}>
              Load more artists
            </button>
            )}
          </>
          )}

          {(trackList.length === 0 && artistList.length === 0 && query.length > 0) && (
          <div className='flex text-gray-500 justify-center items-center h-[8rem]'>검색결과가 없습니다</div>
          )}
        </div>
      )}

    </div>
  );
}
