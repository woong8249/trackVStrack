import { useModal } from '@hooks/useModal';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import { TrackComparisonLineChart } from '@components/TrackComparisonLineChart';
import { PlatformName } from '@constants/platform';
import { SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import TrackInfoCard from '@components/TrackInfoCard';

interface Prob {
    selectedTracks:SelectedTrack[]
    selectedPlatformName:PlatformName
    startDate:Date
    endDate:Date
  }

export function TrackComparisonLineChartWrapper({
  selectedTracks, startDate, endDate, selectedPlatformName,
}:Prob) {
  const {
    isModalOpen: isChartComparisonHelpModalOpen,
    setIsModalOpen: setChartComparisonHelpModalOpen,
    modalRef: chartComparisonHelpModalRef,
  } = useModal();

  const isTrackWithArtistResponse = (
    selectedTrack: SelectedTrack,
  ): selectedTrack is SelectedTrack & { track: TrackWithArtistResponse } => (selectedTrack.track as TrackWithArtistResponse)?.titleName !== undefined;

  const fSelectedTracks = selectedTracks.filter(isTrackWithArtistResponse);
  return (
    <div className='flex w-full gap-2 flex-col  lg:flex-row'>
      {/* contents1 */}
      <div className='w-full lg:w-[70%] bg-white rounded-md '>
        <div className="flex  my-4 py-4 px-6">
          <div className='flex'>
            <div className="text-base px-2">📉 트랙간 차트 성적비교</div>

            <button onClick ={(e) => { e.stopPropagation(); setChartComparisonHelpModalOpen((pre) => !pre); }}>
              <RxQuestionMarkCircled size={20} />
            </button>
          </div>

        </div>

        { isChartComparisonHelpModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
          <div
          ref={chartComparisonHelpModalRef}
          className="px-6 py-6 flex flex-col bg-white rounded-lg max-w-md shadow-lg"
          role="dialog"
          aria-labelledby="chart-comparison-title"
          aria-describedby="chart-comparison-description"
        >
            <h2 id="chart-comparison-title" className="mb-4 text-lg font-semibold text-gray-700">
              📉 트랙 간 차트 성적 비교
            </h2>

            <section id="chart-comparison-description" className="text-gray-500 space-y-3">
              <p>
                여러 트랙의
                {' '}
                <strong className="text-gray-800">주간 차트 순위</strong>
                {' '}
                변동을 한눈에 확인해 보세요.
              </p>

              <p>
                <strong className="text-gray-800">좌측 상단</strong>
                {' '}
                달력 버튼을 통해 특정 기간을 필터링할 수 있습니다.
              </p>

              <p>
                <strong className="text-gray-800">우측 상단</strong>
                {' '}
                플랫폼 버튼을 통해 플랫폼을 선택할 수 있습니다.
              </p>
            </section>
          </div>
        </div>

        )}

        <TrackComparisonLineChart
          tracks={fSelectedTracks}
          selectedPlatformName={selectedPlatformName}
          startDate={startDate}
          endDate={endDate} />

      </div>

      {/* contents2 */}
      <div className='w-full lg:w-[30%] space-y-2'>
        {fSelectedTracks.map((track) => (
          <div className={'bg-white  flex items-center rounded-md'}key={track.id}>
            <div style={{ backgroundColor: track.color }} className={'w-2.5 h-2.5 rounded-full ml-4  mr-2'}></div>

            <TrackInfoCard
              track={track.track}
              size={100} />
          </div>
        ))}
      </div>
    </div>
  );
}
