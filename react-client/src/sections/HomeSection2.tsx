import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';
import { fetcher, trackEndpoints } from '@utils/axios';
import LoadingSpinner from '@components/LoadingSpinner';
import ErrorAlert from '@components/ErrorAlert';
import { Platform, TrackWithArtistResponse } from '@typings/track';
import Slider from 'react-slick';

import PlatformComparisonOfTrackBox from '@layouts/PlatformComparisonOfTrackBox';
import { NextArrow, PrevArrow } from '@components/SliderArrows';

export default function HomeSection2() {
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
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
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          draggable: true,
        },
      },
    ],
  };

  async function fetchTracks() {
    setLoading(true);
    setError(null);
    try {
      const [endpoint, params] = trackEndpoints.getTracks({
        minWeeksOnChart: 30,
        withArtists: true,
        sort: 'random' as const,
      });
      const response = await fetcher<TrackWithArtistResponse[]>(endpoint, params);

      setTracks(response);
    } catch (err) {
      setError(err as unknown as Error);
    } finally {
      setLoading(false);
    }
  }

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
      <PlatformComparisonOfTrackBox track={track} startDate={startDate} endDate={endDate} />
    );
  }

  useEffect(() => {
    fetchTracks();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} retryFunc={fetchTracks} />;

  return (
    <div className="w-full bg-[#eaeff8] flex justify-center items-center py-[10rem]">
      <div>
        <div className="relative">
          <div className="absolute right-1/2 transform -translate-y-[80%] translate-x-[110px] w-[200px] h-[200px] bg-cover bg-center " style={{ backgroundImage: "url('lineChartBg.png')" }}>
          </div>

          <h2 className="relative text-center text-[#444746] text-2xl md:text-3xl lg:text-4xl m-8">여러 플렛폼을 한번에</h2>
        </div>

        <h3 className="relative text-center text-[#444746] mb-12">플랫폼별로 서로 다른 차트 순위를 한눈에 비교해보세요.</h3>

        <Slider {...settings} className="xl:w-[80rem] lg:w-[60rem] sm:w-[30rem] w-[22rem] ">
          {tracks.map((track, index) => (
            <div key={index} className='p-2'>
              {PlatformComparisonOfTrackWithLineChartWrapper(track)}
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
