import { ArtistResponse } from '@typings/artist';
import { TrackResponse } from '@typings/track';
import { trackWithArtistApi, artistsApi } from '@utils/axios';
import React, { useState, useRef, useEffect } from 'react';
import TrackInfoCard from './TrackInfoCard';
import ArtistsInfoCard from './ArtistsInfoCard';

export default function ModalSearch() {
  const [modalQuery, setModalQuery] = useState(''); // 모달 내 검색창 상태
  const [artistList, setArtistList] = useState<ArtistResponse[]>([]);
  const [trackList, setTrackList] = useState<TrackResponse[]>([]);
  const modalSearchRef = useRef<HTMLInputElement>(null); // 모달 내부 검색창 참조

  // 모달 내 검색 요청 함수
  async function search(query: string) {
    const trackSearchResult = await trackWithArtistApi.getTracksWithArtist({
      sort: 'desc', offset: 0, limit: 5, query,
    });
    const artistSearchResult = await artistsApi.getArtists({
      sort: 'desc', offset: 0, limit: 5, query,
    });
    setTrackList(trackSearchResult);
    setArtistList(artistSearchResult);
  }

  // 모달 내 입력 이벤트 처리 함수
  async function handleModalInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setModalQuery(value);

    if (value.length > 1) {
      search(value);
    }
  }

  // 모달이 열릴 때 내부 검색창에 자동으로 포커스
  useEffect(() => {
    if (modalSearchRef.current) {
      modalSearchRef.current.focus();
    }
  }, []);

  return (
    <>
      {/* 모달 내부의 검색창 */}
      <input
            ref={modalSearchRef}
            type="text"
            placeholder="Search for tracks or artists..."
            value={modalQuery}
            onChange={handleModalInput}
            className="w-full py-2 pl-4 pr-10 mb-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

      {/* 검색 결과: 트랙 리스트 */}
      {trackList.length > 0 && (
        <div>
          <h3 className="py-1 px-2 text-lg font-bold">Tracks</h3>

          <ul>
            {trackList.map((track) => (
              <li key={track.id} className="py-1 px-2 hover:bg-gray-100 rounded-md">
                <TrackInfoCard track={track}></TrackInfoCard>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 검색 결과: 아티스트 리스트 */}
      {artistList.length > 0 && (
        <div>
          <h3 className="py-1 px-2 text-lg font-bold">Artists</h3>

          <ul>
            {artistList.map((artist) => (
              <li key={artist.id} className="py-1 px-2 hover:bg-gray-100 rounded-md">
                <ArtistsInfoCard artist={artist}></ArtistsInfoCard>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 검색 결과가 없을 때 */}
      {trackList.length === 0 && artistList.length === 0 && (
        <p className="text-gray-500">No results found.</p>
      )}
    </>
  );
}
