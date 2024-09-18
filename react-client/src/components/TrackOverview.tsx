import {
  useState, useEffect,
} from 'react';
import ChartGraph from './ChartGraph';
import TrackInfoCard from './TrackInfoCard';
import { Track } from 'src/types/track';

interface Props {
  track: Track;
}

export default function TrackOverview({ track }: Props) {
  const [isLargeViewport, setIsLargeViewport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsLargeViewport(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
    role="button"
    tabIndex={0}
    onClick={() => { setIsModalOpen(true); }}
    className='border-[1px] border-[#9A9A9A] rounded-md hover:bg-gray-200 transition cursor-pointer shadow-2xl'
    >
      <TrackInfoCard track={track} />
      {isLargeViewport && <ChartGraph track={track} />}

      {/* modal */}
      {isModalOpen && (
        <div
          role='button'
          tabIndex={0}
          key={track.id}
           className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-15"
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
          <div className="bg-white rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto" >
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
