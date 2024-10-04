import Logo from '@components/Logo';
import TrackOverview from '@components/TrackOverview';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { trackWithArtistApi } from '@utils/axios';
import { TrackWithArtistResponse } from '@typings/track-artist';

function Main() {
  const [isLargeViewport, setIsLargeViewport] = useState(false);
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await trackWithArtistApi.getTracksWithArtist({ offset: 100 });
        setTracks(response); // 데이터 상태에 저장
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      }
    };
    fetchTracks();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeViewport(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-[#fff] text-[#3D3D3D]  min-h-screen min-w-[375px]">
      <div className='mb-[2rem] '>
        <Logo></Logo>
      </div>

      <div className="border-b-2 w-3/4 mx-auto"></div>

      <h1 className="text-[black] text-center text-[1.2rem] md:text-[2rem] lg:text-[2.5rem] font-bold m-[3rem] text-shadow">
        "Easily View and Compare Track Charts."
      </h1>

      <span className="flex justify-center items-center font-[400] text-center text-[0.8rem] md:text-[1.2rem] mb-[3rem] text-[#9A9A9A]">
        "당신의 최애곡의 차트 퍼포먼스를 간편히 확인하세요.
        <br></br>
        또 서로 다른 차트와도 비교해 보세요."
      </span>

      <div className="flex justify-center items-center mb-[5rem]">
        <Link to={'dashboard'}>
          <button className="bg-[#b4ec51] text-[black] py-[0.5rem] px-[1rem] font-bold rounded hover:bg-[#9ab867]">
            Get Started
          </button>
        </Link>
      </div>

      <div className=' flex justify-center items-center gap-[2rem] flex-wrap pb-[3rem]'>
        {tracks.map(
          (track) => (
            <TrackOverview
              key= {track.id}
              track={track}
              isLargeViewport={isLargeViewport}
            />
          ),
        )}
      </div>
    </div>
  );
}

export default Main;
