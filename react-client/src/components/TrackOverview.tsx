import { useState, useEffect } from 'react';
import ChartGraph from './ChartGraph';
import TrackInfoCard from './TrackInfoCard';
import { Track } from 'src/types/track';

interface Props {
  track: Track;
}

export default function TrackOverview({ track }: Props) {
  const [isLargeViewport, setIsLargeViewport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

  useEffect(() => {
    const handleResize = () => {
      setIsLargeViewport(window.innerWidth >= 768); // md 이상일 때 true로 설정
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 로드 시 호출

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
    role="button"
    tabIndex={0}
    onClick={() => { setIsModalOpen(true); }}
    className='border-[1px] border-[#9A9A9A] rounded-md hover:bg-gray-200 transition cursor-pointer shadow-2xl'>
      <TrackInfoCard track={track} />
      {isLargeViewport && <ChartGraph track={track} />}

      {/* modal */}
      {isModalOpen && (
        <div key={track.id} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-4 relative max-h-[auto] w-[autosi] overflow-auto ">
            <button
            className="fixed top-4 right-4 text-gray-600 hover:text-gray-800 font-bold text-[3rem]"
            onClick={(e) => {
              e.stopPropagation(); // 이벤트 버블링 방지
              setIsModalOpen(false);
            }}>
              ×
            </button>

            <div className="w-[50rem] sm:w-[70rem]  overflow-auto">
              <ChartGraph track={track} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
