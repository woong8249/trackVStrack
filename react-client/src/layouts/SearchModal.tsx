import { useEffect, useState } from 'react';
import SearchBar from '@components/SearchBar';
import { TrackResponse } from '@typings/track';
import { trackWithArtistApi } from '@utils/axios';
import TrackInfoCard from '@components/TrackInfoCard';

export default function SearchModal() {
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<TrackResponse[]>([]);

  useEffect(() => {
    if (query !== '') {
      trackWithArtistApi.getTracksWithArtist({ query }).then((tracks) => {
        setTracks(tracks);
      });
    }
  }, [query]);

  return (
    <div className='w-full' >
      <SearchBar >
        <input
        type="text"
        placeholder="Search Track or Artist Name"
        onClick={() => { setIsModalOpen(true); }}
        onFocus={(e) => e.target.blur()}
        className="bg-gray-100 rounded-full focus:outline-none flex-grow px-4 py-2 "
      />
      </SearchBar>

      {isModalOpen && (
        <div
        role='button'
        tabIndex={0}
        className="bg-black bg-opacity-50 min-w-[20rem] fixed inset-0 z-50 flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) { // 모달 외부 클릭 시
            e.stopPropagation();
            setIsModalOpen(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsModalOpen(false); // ESC 키를 누르면 모달 닫기
          }
        }}
        >
          <div className='bg-white rounded-3xl h-[80vh] w-[80vw] overflow-auto'>
            <div className='px-[2rem] py-[1.5rem]'>
              <SearchBar query={query} setQuery={setQuery} ></SearchBar>
            </div>

            <button
            className="fixed top-4 right-4 text-gray-600 hover:text-gray-800 font-bold text-[2.5rem]"
            onClick={(e) => {
              e.stopPropagation(); // 이벤트 버블링 방지
              setIsModalOpen(false);
            }}>
              ×
            </button>

            <div className='flex justify-center items-center'>

              {(query && (tracks.length > 0)) && (
              <div>
                <span>tracks</span>
                {tracks.map((track) => <TrackInfoCard track={track} key={track.id} />)}
              </div>
              )}

              {(query && (tracks.length > 0)) && (
              <div>
                <span>Artists</span>
                {tracks.map((track) => <TrackInfoCard track={track} key={track.id} />)}
              </div>
              )}

            </div>
          </div>
        </div>
      ) }

    </div>
  );
}

// 1. 스로틀링
// 3.  배치
