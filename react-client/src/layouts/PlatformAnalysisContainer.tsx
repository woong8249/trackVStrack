import ArtistsInfoCard from '@components/ArtistsInfoCard';
import PlatformComparisonOfTrackWithLineChart from '@layouts/PlatformComparisonOfTrackWithLineChart';
import { useCachedTrack } from '@hooks/useStoredTrack';
import { SelectedTrack } from '@pages/ExplorePage';
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from 'react-icons/io';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import Slider, { CustomArrowProps } from 'react-slick';
import PlatformAnalysisBox from './PlatformAnalysisBox';
import { Platform } from '@typings/track';
import { useEffect, useState } from 'react';
import WeekRangePicker from '@components/WeekRangePicker';
import { useModal } from '@hooks/useModal';

function SamplePrevArrow(props: CustomArrowProps) {
  const { className, onClick } = props;
  return (
    <IoIosArrowRoundBack onClick={onClick} className={`arrow ${className} z-10 `} style={{ color: 'white' }} />
  );
}

function SampleNextArrow(props: CustomArrowProps) {
  const { className, onClick } = props;
  return (
    <IoIosArrowRoundForward onClick={onClick} className={`arrow ${className}`} style={{ color: 'white' }} />
  );
}

const settings = {
  dots: true,
  infinite: true,
  lazyLoad: 'progressive' as const,
  speed: 800,
  slidesToScroll: 1,
  slidesToShow: 1,
  nextArrow: <SampleNextArrow />,
  prevArrow: <SamplePrevArrow />,
  draggable: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        draggable: true,
      },
    },
  ],
};

interface Prob {
    selectedTrack:SelectedTrack
  }

export function PlatformAnalysisContainer({ selectedTrack }:Prob) {
  const cachedTrack = useCachedTrack(selectedTrack.track);
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  useEffect(() => {
    if (cachedTrack) {
      const { platforms } = cachedTrack;
      const availablePlatforms = [platforms?.bugs, platforms?.genie, platforms?.melon].filter(Boolean) as Platform[];
      const startDates: string[] = availablePlatforms.map(
        (platform) => platform.weeklyChartScope[0].startDate,
      ).filter(Boolean) as string[];

      const endDates: string[] = availablePlatforms.map(
        (platform) => platform.weeklyChartScope[platform.weeklyChartScope.length - 1]?.endDate,
      ).filter(Boolean) as string[];
      const startDate = new Date(Math.min(...startDates.map((date) => new Date(date).getTime())));
      const endDate = new Date(new Date(Math.max(...endDates.map((date) => new Date(date).getTime()))));

      setStartDate(startDate);
      setEndDate(endDate);
    }
  }, [cachedTrack]);

  return (
    cachedTrack && (

    <div className="mb-8 w-full">
      <div className=' mb-2 '>
        <div className="text-lg px-2 py-1" style={{ display: 'inline-block' }}>{cachedTrack.titleName}</div>
        <WeekRangePicker startDate={startDate} endDate={endDate} onDateRangeChange={handleDateRangeChange} />
      </div>

      {/* 부모 */}
      <div className="w-full flex flex-col gap-2 items-center md:items-stretch  md:flex-row md:justify-center">
        {/* 자식1 */}
        <div className="bg-white p-6 rounded-md w-[100%]  md:w-[60%] ">
          <div className="flex items-center mb-8">
            <div className="text-base px-2">📈 플랫폼별 차트순위</div>

            <button onClick ={(e) => { e.stopPropagation(); setIsModalOpen((pre) => !pre); }}>
              <RxQuestionMarkCircled size={20} />
            </button>

            { isModalOpen && (
              <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
                <div ref={modalRef} className="px-4 py-4 flex flex-col justify-start items-start bg-white rounded-lg max-w-md">
                  <div className='mb-4 text-lg text-gray-600'>📈 플랫폼별 차트순위 </div>

                  <p className="mb-2 text-gray-400">
                    각 플랫폼에서의 주간 차트 순위 변동을 한번에 확인해 보세요.
                  </p>

                  <p className="text-gray-400">
                    타이틀 옆 달력 버튼을 통해 특정 기간을 필터할 수 있습니다.
                  </p>
                </div>
              </div>

            )}
          </div>

          <PlatformComparisonOfTrackWithLineChart
            track={cachedTrack}
            startDate={startDate}
            endDate={endDate}
            />
        </div>

        {/* 자식2 */}
        <div className=" w-[100%]  md:w-[40%] ">
          {/* 자식2 -자식1 */}
          <div className='bg-white px-6 pb-6 rounded-md '>
            <div className="px-2 py-7">🎤 아티스트</div>

            {cachedTrack.artists.length > 1 ? (
              <div className="w-full flex justify-center">
                <Slider {...settings} className="w-[90%] z-[3] ">
                  {cachedTrack.artists.map((artist, index) => (
                    <div key={index} className="border border-gray-300 rounded-md">
                      <ArtistsInfoCard artist={artist} size={100} />
                    </div>
                  ))}
                </Slider>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md">
                <ArtistsInfoCard artist={cachedTrack.artists[0]} size={100} />
              </div>
            )}

          </div>

          {/* 자식2 -자식2 */}
          <div className='mt-2'>
            <PlatformAnalysisBox platforms={cachedTrack.platforms} startDate={startDate} endDate={endDate} />
          </div>

        </div>
      </div>

    </div>
    )
  );
}
