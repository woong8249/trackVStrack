import { ArtistResponse } from '@typings/artist';

import { tracksApi, artistsApi } from '@utils/axios';
import React, { useState, useRef, useEffect } from 'react';
import TrackInfoCard from '../TrackInfoCard';
import ArtistsInfoCard from '../ArtistsInfoCard';
import { TrackWithArtistResponse } from '@typings/track';

export default function DefaultModalSearch() {
  const [modalQuery, setModalQuery] = useState(''); // 모달 내 검색창 상태
  const [artistList, setArtistList] = useState<ArtistResponse[]>([]);
  const [trackList, setTrackList] = useState<TrackWithArtistResponse[]>([]);
  const modalSearchRef = useRef<HTMLInputElement>(null); // 모달 내부 검색창 참조
  const debounceTimeoutRef = useRef<number | undefined>(undefined); // 디바운스 타이머 참조
  const [trackOffset, setTrackOffset] = useState(0); // 트랙 offset 상태
  const [artistOffset, setArtistOffset] = useState(0); // 아티스트 offset 상태
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);

  // 모달 내 검색 요청 함수
  async function search(query: string) {
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
      setTrackList(trackSearchResult);
      setArtistList(artistSearchResult);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  async function loadMoreTracks() {
    try {
      const trackSearchResult = await tracksApi.getTracks({
        sort: 'desc',
        offset: trackOffset + 5, // offset 증가
        limit: 5,
        query: modalQuery.replace(/\s+/g, ''),
        withArtists: true,
      }) as TrackWithArtistResponse[];

      if (trackSearchResult.length === 0) {
        setHasMoreTracks(false);
      } else {
        setTrackList((prev) => [...prev, ...trackSearchResult]);
        setTrackOffset((prevOffset) => prevOffset + 5);
      }
    } catch (error) {
      console.error('Error fetching more tracks:', error);
    }
  }

  async function loadMoreArtists() {
    try {
      const artistSearchResult = await artistsApi.getArtists({
        sort: 'desc',
        offset: artistOffset + 5, // offset 증가
        limit: 5,
        query: modalQuery.replace(/\s+/g, ''),
      });

      if (artistSearchResult.length === 0) {
        setHasMoreArtists(false);
        setArtistList((prev) => [...prev, ...artistSearchResult]);
      } else {
        setArtistList((prev) => [...prev, ...artistSearchResult]);
        setArtistOffset((prevOffset) => prevOffset + 5);
      }
    } catch (error) {
      console.error('Error fetching more artists:', error);
    }
  }

  // 모달 내 입력 이벤트 처리 함수
  function handleModalInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setModalQuery(value);
    setTrackOffset(0);
    setArtistOffset(0);
    // 디바운스 처리 (500ms)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      if (value.trim().length > 0) {
        search(value);
      }
    }, 500);
  }

  // 모달이 열릴 때 내부 검색창에 자동으로 포커스
  useEffect(() => {
    if (modalSearchRef.current) {
      modalSearchRef.current.focus();
    }
  }, []);

  let content :React.ReactNode;
  if (modalQuery.length < 1) {
    content = <p className="text-gray-500">Please enter at least 1 characters to search.</p>;
  } else if (trackList.length === 0 && artistList.length === 0) {
    content = <p className="text-gray-500">No results found.</p>;
  } else {
    // 검색 결과가 있는 경우
    content = (
      <>
        {/* 검색 결과: 트랙 리스트 */}
        {trackList.length > 0 && (
        <div className='mt-[1rem]'>
          <div className="py-2 px-2 text-base font-bold border  bg-gray-100">{'Tracks >'}</div>

          <ul>
            {trackList.map((track) => (
              <li key={track.id} className="py-1   rounded-md border">
                <TrackInfoCard track={track} />
              </li>
            ))}
          </ul>

          {/* 더 보기 버튼 */}
          {hasMoreTracks ? (
            <button
                className="w-full mt-2 py-2 px-4 text-gray-500 font-bold  rounded-md hover:bg-gray-100"
                onClick={loadMoreTracks}
              >
              Load more tracks
            </button>
          ) : ''}
        </div>
        )}

        {/* 검색 결과: 아티스트 리스트 */}
        {artistList.length > 0 && (
        <div className='mt-[4rem]'>
          <div className="py-2 px-2 text-base font-bold border  bg-gray-100">{'Artists >'}</div>

          <ul>
            {artistList.map((artist) => (
              <li key={artist.id} className="py-1 rounded-md border">
                <ArtistsInfoCard artist={artist} />
              </li>
            ))}
          </ul>

          {hasMoreArtists && (
          <button
                className="w-full mt-2 py-2 px-4 text-gray-500 font-bold  rounded-md hover:bg-gray-100"
                onClick={loadMoreArtists}
              >
            Load more artists
          </button>
          )}
        </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* 모달 내부의 검색창 */}
      <input
        ref={modalSearchRef}
        type="text"
        placeholder="Search for track or artist..."
        value={modalQuery}
        onChange={handleModalInput}
        className="w-full  py-2 pl-4 pr-10 mb-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

      {content}
    </>
  );
}
