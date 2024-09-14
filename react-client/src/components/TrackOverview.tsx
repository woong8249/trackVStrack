import { useState, useEffect } from 'react';
import ChartGraph from './ChartGraph';
import TrackInfoCard from './TrackInfoCard';
import { Track } from 'src/types/track';

interface Props {
  track: Track;
}

export default function TrackOverview({ track }: Props) {
  const [isLargeViewport, setIsLargeViewport] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeViewport(window.innerWidth >= 768); // md 이상일 때 true로 설정
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 로드 시 호출

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='border-[1px] border-[#9A9A9A] rounded-md hover:bg-gray-200 transition cursor-pointer shadow-2xl' >
      <TrackInfoCard track={track} />
      {isLargeViewport && <ChartGraph track={track} />}
    </div>
  );
}
