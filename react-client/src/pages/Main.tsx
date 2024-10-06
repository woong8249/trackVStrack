import TrackOverview from '@components/TrackOverview';
import { useEffect, useState } from 'react';
import { trackWithArtistApi } from '@utils/axios';
import { TrackWithArtistResponse } from '@typings/track-artist';
import TopNavBar from '@layouts/TopNavBar';

function Main() {
  const [isLargeViewport, setIsLargeViewport] = useState(false);
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await trackWithArtistApi
          .getTracksWithArtist({ minWeeksOnChart: 30, sort: 'random' });
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
    <div className="min-h-screen min-w-[375px]">

      <TopNavBar></TopNavBar>

      <h1 className="text-center responsive-h1 font-bold mt-[10rem] mb-[1rem] text-shadow">
        "Easily View and Compare Track Charts."
      </h1>

      <span className="flex justify-center items-center font-[400] text-center responsive-text mt-[3rem] text-[#9A9A9A]">
        "당신의 최애곡의 차트 퍼포먼스를 간편히 확인하세요.
        <br></br>
        또 서로 다른 차트와도 비교해 보세요."
      </span>

      <div className=' flex justify-center items-center gap-[2rem] flex-wrap mt-[3rem] pb-[3rem]'>
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
