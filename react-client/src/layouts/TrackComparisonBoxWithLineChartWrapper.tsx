import { useModal } from '@hooks/useModal';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import { TrackComparisonBoxWithLineChart } from './TrackComparisonBoxWithLineChart';
import { PlatformName } from '@constants/platform';
import { SelectedTrack } from '@pages/ExplorePage';

interface Prob {
    selectedTracks:SelectedTrack[]
    selectedPlatformName:PlatformName
    startDate:Date
    endDate:Date
  }

export function TrackComparisonBoxWithLineChartWrapper({
  selectedTracks, startDate, endDate, selectedPlatformName,
}:Prob) {
  const {
    isModalOpen: isChartComparisonHelpModalOpen,
    setIsModalOpen: setChartComparisonHelpModalOpen,
    modalRef: chartComparisonHelpModalRef,
  } = useModal();
  return (
    <div className='w-full'>
      <div className="flex  mb-8 p-6">
        {/* 헤더자식1- 박스의 타이틀명 */}
        <div className='flex'>
          <div className="text-base px-2">📉 트랙간 차트 비교</div>

          <button onClick ={(e) => { e.stopPropagation(); setChartComparisonHelpModalOpen((pre) => !pre); }}>
            <RxQuestionMarkCircled size={20} />
          </button>
        </div>

      </div>

      { isChartComparisonHelpModalOpen && (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
        <div ref={chartComparisonHelpModalRef} className="px-4 py-4 flex flex-col justify-start items-start bg-white rounded-lg max-w-md">
          <div className='mb-4 text-lg text-gray-600'>📉 트랙간 플랫폼별 차트 비교 </div>

          <p className="mb-2 text-gray-400">
            각 트랙의 플랫폼별 성적을 비교해 보세요.
          </p>

          <p className="text-gray-400">
            타이틀 옆 달력 버튼을 통해 특정 기간을 필터할 수 있습니다.
          </p>
        </div>
      </div>

      )}

      <TrackComparisonBoxWithLineChart
          selectedTracks={selectedTracks}
          selectedPlatformName={selectedPlatformName}
          startDate={startDate}
          endDate={endDate} />
    </div>
  );
}
