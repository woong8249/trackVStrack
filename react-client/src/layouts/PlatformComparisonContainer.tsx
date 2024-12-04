import PlatformChartRankComparisonLineChart from '@layouts/PlatformChartRankComparisonLineChart';
import { useCachedTrack } from '@hooks/useCachedTrack';
import { SelectedTrack } from '@pages/ExplorePage';
import PlatformChartInDurationComparisonBarChart from './PlatformChartInDurationComparisonBarChart';
import { useEffect, useState } from 'react';
import WeekRangePicker from '@components/WeekRangePicker';
import { ArtistsBox } from './ArtistsBox';
import { getTrackDateRange } from '@utils/time';
import { HelpModal } from '@components/HelpModal';

interface Prob {
    selectedTrack:SelectedTrack
  }

export function PlatformComparisonContainer({ selectedTrack }:Prob) {
  const cachedTrack = useCachedTrack(selectedTrack.track);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  useEffect(() => {
    if (cachedTrack) {
      const { startDate, endDate } = getTrackDateRange(cachedTrack);
      setStartDate(startDate);
      setEndDate(endDate);
    }
  }, [cachedTrack]);

  return (
    cachedTrack && (

    <div className="mb-8 w-full">
      <div className=' mb-2  flex items-center'>
        <div className="text-lg px-2 py-1" style={{ display: 'inline-block' }}>{cachedTrack.titleName}</div>
        <WeekRangePicker startDate={startDate} endDate={endDate} onDateRangeChange={handleDateRangeChange} />
      </div>

      <div className="w-full flex flex-col gap-2 items-center md:items-stretch  md:flex-row md:justify-center">
        <div className="bg-white p-6 rounded-md w-[100%]  md:w-[60%] ">
          <div className="flex items-center mb-8">
            <div className="text-base px-2">📈 플랫폼별 차트순위 비교</div>

            <HelpModal>
              <h2 id="platform-comparison-title" className="mb-4 text-lg font-semibold text-gray-700">
                📈 플랫폼별 차트 순위 비교
              </h2>

              <section id="platform-comparison-description" className="text-gray-500 space-y-3">
                <p>
                  해당 트랙의 플랫폼별
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
              </section>
            </HelpModal>
          </div>

          <PlatformChartRankComparisonLineChart
            track={cachedTrack}
            startDate={startDate}
            endDate={endDate}
            />
        </div>

        {/* 자식2 */}
        <div className=" w-[100%]  md:w-[40%] ">
          <ArtistsBox track={cachedTrack} />

          <div className='mt-2'>
            <PlatformChartInDurationComparisonBarChart platforms={cachedTrack.platforms} startDate={startDate} endDate={endDate} />
          </div>

        </div>
      </div>

    </div>
    )
  );
}
