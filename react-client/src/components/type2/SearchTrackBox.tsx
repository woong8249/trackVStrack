/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { tracksApi } from '@utils/axios';
import React, { useState, useRef, useEffect } from 'react';
import TrackInfoCard from '../TrackInfoCard';
import { TrackWithArtistResponse } from '@typings/track';
import ErrorAlert from '@components/ErrorAlert'; // Error 컴포넌트
import LoadingSpinner from '@components/LoadingSpinner'; // 로딩 스피너 컴포넌트
import { useModal } from '@hooks/useModal';
import { SelectedTrack } from '@pages/ExplorePage';
import { FaPen } from 'react-icons/fa6';

type ImageSize = 100 | 80 | 70;

interface Prob {
  selectedTrack:SelectedTrack
  selectTrack :(id: number, selectedTrack: TrackWithArtistResponse) => void;
  addSelectBox:(id:number)=> void
  deleteSelectBox:(id:number) => void
  deleteTrack:(id:number) => void
}

export default function SearchTrackBox({
  selectedTrack,
  selectTrack,
  addSelectBox,
  deleteSelectBox,
  deleteTrack,
}:Prob) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const {
    isModalOpen: isModifyModalOpen,
    setIsModalOpen: setIsModifyModalOpen,
    modalRef: modifyModalRef,
  } = useModal();
  const [loading, setLoading] = useState(false); // 로딩 상태 기본값 false
  const [error, setError] = useState<Error | null>(null);
  const [query, setQuery] = useState(''); // 모달 내 검색창 상태
  const [trackList, setTrackList] = useState<TrackWithArtistResponse[]>([]);
  const [additionalLoading, setAdditionalLoading] = useState(false); // 추가 요청 시 로딩 상태
  const debounceTimeoutRef = useRef<number | undefined>(undefined); // 디바운스 타이머 참조
  const [trackOffset, setTrackOffset] = useState(0); // 트랙 offset 상태
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const containerRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>(100);
  const height = imageSize === 100 ? 'h-[120px]' : imageSize === 80 ? 'h-[100px]' : 'h-[90px]';
  const width = 'w-full';

  useEffect(() => {
    const handleFocusIn = () => setFocused(true);
    const handleFocusOut = () => setFocused(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('focusin', handleFocusIn); // 포커스 감지
      container.addEventListener('focusout', handleFocusOut); // 포커스 떠날 때
    }

    return () => {
      if (container) {
        container.removeEventListener('focusin', handleFocusIn);
        container.removeEventListener('focusout', handleFocusOut);
      }
    };
  }, [containerRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width } = entry.contentRect;
      if (width >= 540) {
        setImageSize(100);
      } else if (width >= 450) {
        setImageSize(80);
      } else {
        setImageSize(70);
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

      if (trackSearchResult.length > 0) setIsModalOpen(true);
      setTrackList(trackSearchResult);
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

  function handleModalInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setQuery(value);
    setTrackOffset(0);

    if (value.length === 0) {
      setTrackList([]);
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
    <div className={`relative ${width} ${focused ? 'z-[8]' : 'z-5'} `} ref={containerRef} >

      {selectedTrack.activate === false ? (
        <div
        className={`bg-white ${width} flex items-center rounded-xl bg-[#0b57d11c] hover:bg-gray-400 responsive-text text-gray-500 px-10 ${height}`}
        role='button'
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); addSelectBox(selectedTrack.id); }}
        >
          + 추가
        </div>
      )
        : selectedTrack.track ? (
          <div
            className={`bg-white ${width} ${height} flex items-center rounded-xl hover:bg-gray-300`}
            onClick={ (e) => { e.stopPropagation(); setIsModifyModalOpen((pre) => !pre); }}
            role='button'
            tabIndex={0}>
            <div className={`w-2.5 h-2.5 ${selectedTrack.color} rounded-full ml-4  mr-2`}></div>
            <TrackInfoCard track={selectedTrack.track} size={imageSize}></TrackInfoCard>

            {isModifyModalOpen && (
            <div ref={modifyModalRef} className={'text-gray-500 absolute top-0 right-0  mt-2 bg-white border border-gray-300 shadow-md rounded-md p-2 w-40'}>
              <button
                onClick={() => { deleteSelectBox(selectedTrack.id); }}
                className="flex items-center w-full px-2 py-2 text-sm hover:bg-gray-100 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>

                <span>삭제</span>
              </button>

              <button
                onClick={(e) => { deleteTrack(selectedTrack.id); e.currentTarget.focus(); }}
                className="flex items-center w-full px-2 py-2 text-sm hover:bg-gray-100 rounded">
                <FaPen className="mr-2" />
                <span>수정</span>
              </button>
            </div>
            )}
          </div>

        ) : (
          <div className={width}>
            <input
              type="text"
              className={`px-6 border ${height} ${width} border-gray-300 focus:outline-none rounded-xl`}
              placeholder="곡명을 입력하세요"
              value={query}
              onChange={handleModalInput}
              onClick={(e) => {
                e.stopPropagation();
                if (query.length > 0) {
                  setIsModalOpen(true);
                }
              }}
            />

            {isModalOpen && (
            <div ref={modalRef} className="absolute top-full left-0 right-0  bg-gray-50 shadow-lg max-h-[600px] overflow-y-auto rounded-b-[40px]">
              {loading && <LoadingSpinner />}
              {error && <ErrorAlert error={error} retryFunc={() => search(query)} />}

              {trackList.length > 0 && (
                <>
                  <div className="py-2 px-3 text-base text-[14px] font-semibold bg-gradient-to-b from-gray-200 to-gray-50">
                    트랙
                  </div>

                  <ul>
                    {trackList.map((track) => (
                      <li key={track.id} className="px-2 hover:bg-gray-100 rounded-md border-b last:border-b-0">
                        <div role='button' tabIndex={0} onClick={(e) => { e.stopPropagation(); selectTrack(selectedTrack.id, track); }}>
                          <TrackInfoCard track={track} size={imageSize} />
                        </div>
                      </li>
                    ))}
                  </ul>

                  {additionalLoading && <LoadingSpinner size={8} />}

                  {hasMoreTracks && (
                    <button
                      className="w-full py-4 px-4 text-blue-500 text-sm font-semibold rounded-md hover:bg-gray-100 transition-colors"
                      onClick={loadMoreTracks}
                    >
                      Load more tracks
                    </button>
                  )}
                </>
              )}

              {(trackList.length === 0 && query.length > 0) && (
                <div className="flex text-gray-500 justify-center items-center h-[8rem]">
                  검색결과가 없습니다
                </div>
              )}
            </div>
            )}
          </div>
        )}
    </div>
  );
}
