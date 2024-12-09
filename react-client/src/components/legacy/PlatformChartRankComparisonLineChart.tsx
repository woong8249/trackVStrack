// TrackOverview.tsx (분리된 파일)
import ReactDOM from 'react-dom';
import { useModal } from '@hooks/useModal';
import TrackInfoCard from '@components/TrackInfoCard';
import PlatformCompareLineChart from '@layouts/PlatformChartRankComparisonLineChart';
import { TrackWithArtistResponse } from '@typings/track';
import { FaExpandAlt } from 'react-icons/fa';
import React, { useState } from 'react';

interface Prob {
  track: TrackWithArtistResponse;
  startDate:Date
  endDate:Date
}

export default function PlatformChartRankComparisonLineChart({ track, startDate, endDate }: Prob) {
  const [activeModalTrack, setActiveModalTrack] = useState<TrackWithArtistResponse | null>(null);
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();

  const handleModalOpen = (track: TrackWithArtistResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveModalTrack(track); // 클릭한 트랙의 모달을 활성화
    setIsModalOpen(true); // 모달을 열기
  };

  const renderModal = (track: TrackWithArtistResponse) => {
    if (!activeModalTrack || activeModalTrack.id !== track.id) return null;
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg p-4 relative" ref={modalRef}>
          <div className="w-[40rem] sm:w-[50rem] h-[30rem] sm:h-[35rem] overflow-auto">
            <TrackInfoCard track={track} />
            <div className='border-b mt-1`'></div>
            <PlatformCompareLineChart track={track} startDate={startDate} endDate={endDate} />
          </div>
        </div>
      </div>,
      document.body,
    );
  };

  return (
    <div key={track.id.toString()} className="w-full">
      <div className="relative">
        <div className="border-[1px] bg-[white] border-gray-300 rounded-md relative">
          <TrackInfoCard track={track} />
          <div className='border-b mt-1`'></div>
          <PlatformCompareLineChart track={track} startDate={startDate} endDate={endDate} />
        </div>

        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => handleModalOpen(track, e)}
            className="bg-transparent text-green-600 p-2 rounded-full hover:text-green-800"
          >
            <FaExpandAlt size={20} />
          </button>
        </div>

        {/* 모달 렌더링 */}
        {isModalOpen && renderModal(track)}
      </div>
    </div>
  );
}
