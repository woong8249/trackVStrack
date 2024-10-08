/* eslint-disable jsx-a11y/click-events-have-key-events */
import { SyntheticEvent, useState } from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import { useModal } from '@hooks/useModal';
import ChartGraph from './ChartGraph';
import TrackInfoCard from './TrackInfoCard';
import { TrackWithArtistResponse } from '@typings/track-artist';
import 'react-resizable/css/styles.css';
import { FaExpandAlt } from 'react-icons/fa';

interface Props {
  track: TrackWithArtistResponse;
  viewportType: 'small' | 'medium' | 'large';
}

export default function TrackOverview({ track, viewportType }: Props) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const [width, setWidth] = useState(viewportType !== 'small' ? 600 : 400); // width를 상태로 관리

  // width를 기준으로 height와 isLargeContainer를 계산
  const height = (width >= 600) && viewportType !== 'small' ? 130 + (width / 1.6) : 100;
  const isLargeContainer = width >= 600;

  const onResize = (_e: SyntheticEvent, { size }: ResizeCallbackData) => {
    const newWidth = size.width;
    setWidth(newWidth); // width만 상태로 관리
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  return (
    viewportType === 'small' ? (
      <div className="border-[1px] border-[#9A9A9A] rounded-m transition shadow-2xl relative">
        <div style={{ width, height }}>
          <TrackInfoCard track={track} />

          {(viewportType !== 'small' && isLargeContainer) && (
            <>
              <div className="border-b-[1px] border-[#9A9A9A] mb-[1rem]"></div>
              <ChartGraph track={track} />
            </>
          )}
        </div>

        <div className="absolute top-2 right-2">
          <button onClick={handleModalOpen} className="bg-transparent text-green-600 p-2 rounded-full hover:text-green-800">
            <FaExpandAlt size={20} />
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-15 backdrop-blur-sm">
          <div
      ref={modalRef}
      className="bg-white rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto"
      onClick={(e) => e.stopPropagation()}
      role="button"
      tabIndex={0}
    >
            <div className="w-[50rem] sm:w-[70rem] overflow-auto">
              <TrackInfoCard track={track} />
              <div className="border-b-[1px] border-[#9A9A9A] mb-[1rem]"></div>
              <ChartGraph track={track} />
            </div>
          </div>
        </div>
        )}
      </div>
    ) : (
      <div className="border-[1px] border-[#9A9A9A] rounded-m transition shadow-2xl relative">
        <Resizable
        width={width}
        height={height}
        onResize={onResize}
        minConstraints={[400, 100]}
        maxConstraints={[800, 500]}
        lockAspectRatio={false}
      >
          <div style={{ width, height }}>
            <TrackInfoCard track={track} />

            { isLargeContainer && (
            <>
              <div className="border-b-[1px] border-[#9A9A9A] mb-[1rem]"></div>
              <ChartGraph track={track} />
            </>
            )}
          </div>
        </Resizable>

        <div className="absolute top-2 right-2">
          <button onClick={handleModalOpen} className="bg-transparent text-green-600 p-2 rounded-full hover:text-green-800">
            <FaExpandAlt size={20} />
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-15 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto"
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <div className="w-[50rem] sm:w-[70rem] overflow-auto">
              <TrackInfoCard track={track} />
              <div className="border-b-[1px] border-[#9A9A9A] mb-[1rem]"></div>
              <ChartGraph track={track} />
            </div>
          </div>
        </div>
        )}
      </div>
    )
  );
}
