/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
import React, {
  useState, useRef, useEffect, MutableRefObject,
} from 'react';
import TrackInfoCard from './TrackInfoCard';
import ArtistsInfoCard from './ArtistsInfoCard';
import { TrackWithArtistResponse } from '@typings/track';
import ErrorAlert from '@components/ErrorAlert';
import LoadingSpinner from '@components/LoadingSpinner';
import { ArtistResponse } from '@typings/artist';
import { useModal } from '@hooks/useModal';
import { Link, useNavigate } from 'react-router-dom';
import { useFindTracks } from '@hooks/useFindTracks';
import { useFindArtists } from '@hooks/useFindArtists';

type Size = 100 | 80 | 70;

export default function HomeExploreBar() {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const [query, setQuery] = useState('');
  const target = useRef<TrackWithArtistResponse|ArtistResponse| null>(null) as MutableRefObject<TrackWithArtistResponse|ArtistResponse | null>;
  const containerRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState<Size>(100);
  const navigate = useNavigate();
  const {
    loadMoreTracks, trackData, trackError, trackIsLoading, setTrackSize,
  } = useFindTracks({ query });

  const {
    artistData, artistError, artistIsLoading, setArtistSize, loadMoreArtists,
  } = useFindArtists({ query });

  if (trackData?.flat()[0]) {
    target.current = trackData.flat()[0] as TrackWithArtistResponse;
  }
  if (!target.current && artistData?.flat()[0]) {
    target.current = artistData.flat()[0] as ArtistResponse;
  }

  const handleButtonClick = () => {
    if (target.current) {
      navigate('/explore', { state: { track: target.current } });
    } else {
      navigate('/explore');
    }
  };

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    if (e.target.value.length > 0) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }

  function render() {
    if (!isModalOpen) return null;
    let tracksContent :React.ReactNode;
    let artistsContent:React.ReactNode;
    let noResultContent:React.ReactNode;

    // 초기 로딩 상태는 data가 없을 때로 판단
    const isInitialLoading = trackIsLoading && artistIsLoading;

    if (isInitialLoading) {
      return (
        <div ref={modalRef} className="absolute top-full left-0 right-0 z-10 bg-gray-50 shadow-lg max-h-[600px] overflow-y-auto rounded-b-[40px]">
          <LoadingSpinner />
        </div>
      );
    }

    if (trackError || artistError) {
      return (
        <div ref={modalRef} className="absolute top-full left-0 right-0 z-10 bg-gray-50 shadow-lg max-h-[600px] h-[250px] overflow-y-auto rounded-b-[40px]">
          <ErrorAlert
          error={trackError || artistError}
          retryFunc={() => {
            setTrackSize((size) => size);
            setArtistSize((size) => size);
          }}
        />
        </div>
      );
    }

    if (trackData?.flat().length) {
      tracksContent = (
        <>
          <div className="py-2 px-3 text-base text-[14px] font-semibold bg-gradient-to-b from-[#0B57D41C] to-slate-50">트랙</div>

          <ul>
            {trackData.flat().map((track, index) => (
              <Link key={index} to={{ pathname: '/explore' }} state={{ track }}>
                <li className={`px-2 hover:bg-[#0B57D41C] rounded-md border-b last:border-b-0 ${index === 0 && 'bg-[#0B57D41C]'}`}>
                  <TrackInfoCard track={track} size={size} />
                </li>
              </Link>
            ))}
          </ul>

          {trackData[trackData.length - 1].length > 0 && (
            <button className="w-full py-4 px-4 text-blue-500 text-sm font-semibold rounded-md hover:bg-[#0B57D41C] transition-colors" onClick={loadMoreTracks}>
              Load more tracks
            </button>
          )}
        </>
      );
    }

    if (artistData?.flat().length) {
      artistsContent = (
        <>
          <div className="py-2 px-3 text-base text-[14px] font-semibold bg-gradient-to-b from-[#0B57D41C] to-slate-50">아티스트</div>

          <ul>
            {artistData.flat().map((artist, index) => (
              <li key={artist.id} className={ `py-2 px-2 hover:bg-[#0B57D41C] rounded-md border-b last:border-b-0 ${(!tracksContent && index === 0) && 'bg-[#0B57D41C]'}`}>
                <ArtistsInfoCard artist={artist} size={size} />
              </li>
            ))}
          </ul>

          {artistData[artistData.length - 1].length > 0 && (
            <button className="w-full py-2 px-4 text-blue-500 text-sm font-semibold rounded-md hover:bg-[#0B57D41C] transition-colors" onClick={loadMoreArtists}>
              Load more artists
            </button>
          )}
        </>
      );
    }

    if (!trackData?.flat().length && !artistData?.flat().length) {
      noResultContent = (
        <div className="flex text-gray-500 justify-center items-center h-[8rem]">검색결과가 없습니다</div>
      );
    }

    return (
      <div ref={modalRef} className="absolute top-full left-0 right-0 z-10 bg-white shadow-lg max-h-[600px] overflow-y-auto rounded-b-[40px]">
        {tracksContent}
        {artistsContent}
        {noResultContent}
      </div>
    );
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width } = entry.contentRect;
      setSize(width >= 540 ? 100 : width >= 450 ? 80 : 70);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.unobserve(container);
  }, [containerRef]);

  return (
    <div className="relative z-[5]" ref={containerRef}>
      <input
        type="text"
        className={`w-[380px] md:w-[450px] lg:w-[540px] h-[66px] p-8 border border-gray-300 focus:outline-none ${isModalOpen ? 'rounded-t-[40px]' : 'rounded-full'}`}
        placeholder="곡명 또는 아티스트명을 입력하세요"
        value={query}
        onChange={handleInputChange}
        onClick={(e) => {
          e.stopPropagation();
          if (query.length > 0) {
            setIsModalOpen(true);
          }
        }}
      />

      <button
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-blue-500 text-white px-8 py-2 rounded-full shadow-md hover:bg-blue-600 transition duration-300"
        onClick={handleButtonClick}
        >

        탐색
      </button>

      {render()}
    </div>
  );
}
