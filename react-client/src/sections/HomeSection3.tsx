import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import LoadingSpinner from '@components/LoadingSpinner';
import ErrorAlert from '@components/ErrorAlert';
import { Platform, TrackWithArtistResponse } from '@typings/track';
import Slider from 'react-slick';

import PlatformChartRankComparisonLineChart from '@layouts/PlatformChartRankComparisonLineChart';
import { NextArrow, PrevArrow } from '@components/SliderArrows';

interface Prob {
  loading :boolean
  tracks:TrackWithArtistResponse[]
  error:Error |null
  retryFunc:()=>Promise<void>
}

export function HomeSection3({
  loading, tracks, error, retryFunc,
}:Prob) {
  const settings = {
    dots: true,
    infinite: true,
    lazyLoad: 'progressive' as const,
    speed: 800,
    slidesToScroll: 1,
    slidesToShow: 2,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    draggable: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          draggable: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: 1,
          slidesToScroll: 1,
          draggable: true,
        },
      },
    ],
  };

  function PlatformComparisonOfTrackWithLineChartWrapper(track:TrackWithArtistResponse) {
    const { platforms } = track;
    const availablePlatforms = [
      platforms?.bugs,
      platforms?.genie,
      platforms?.melon,
    ].filter(Boolean) as Platform[];
    const startDates: string[] = availablePlatforms.map(
      (platform) => platform.weeklyChartScope[0].startDate,
    ).filter(Boolean) as string[];

    const endDates: string[] = availablePlatforms.map(
      (platform) => platform.weeklyChartScope[platform.weeklyChartScope.length - 1]?.endDate,
    ).filter(Boolean) as string[];

    const startDate = new Date(Math.min(...startDates.map((date) => new Date(date).getTime())));
    const endDate = new Date(Math.max(...endDates.map((date) => new Date(date).getTime())));

    return (
      <div className='bg-white p-4 rounded-md  border-gray-200 border-[1px]'>
        <PlatformChartRankComparisonLineChart track={track} startDate={startDate} endDate={endDate} />
      </div>
    );
  }

  if (loading) return <div className='flex justify-center'><LoadingSpinner /></div>;
  if (error) return <div className='flex justify-center'><ErrorAlert error={error} retryFunc={retryFunc} /></div>;
  return (
    <div className="w-full bg-slate-50 flex justify-center items-center py-[10rem]">
      <div>
        <div className="relative">
          <div className="absolute right-1/2 transform -translate-y-[80%] translate-x-[110px] w-[200px] h-[200px] bg-cover bg-center " style={{ backgroundImage: "url('lineChartBG1.png')" }}>
          </div>

          <h2 className="relative text-center text-[#444746] text-2xl md:text-3xl lg:text-4xl m-8">여러 플렛폼을 한번에</h2>
        </div>

        <h3 className="relative text-center text-[#444746] mb-12">플랫폼별로 서로 다른 차트 순위를 한눈에 비교해보세요.</h3>

        <div className="w-[100vw] sm:w-[80vw]">
          <Slider {...settings} >
            {tracks.map((track, index) => (
              <div key={index} className="p-4">
                {PlatformComparisonOfTrackWithLineChartWrapper(track)}
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
}
