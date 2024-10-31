import ArtistsInfoCard from '@components/ArtistsInfoCard';
import TrackOverview from '@components/TrackOverview';
import { useCachedTrack } from '@hooks/useStoredTrack';
import { SelectedTrack } from '@pages/ExplorePage';
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from 'react-icons/io';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import Slider, { CustomArrowProps } from 'react-slick';
import PlatformAnalysisBox from './PlatformAnalysisBox';

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

  return (
    cachedTrack && (

    <div className="mb-8 w-full">
      <div className="text-lg mb-4 px-6">{cachedTrack.titleName}</div>

      {/* 부모 */}
      <div className="w-full flex flex-col gap-2 items-center md:items-stretch  md:flex-row md:justify-center">
        {/* 자식1 */}
        <div className="bg-white p-6 rounded-md w-[100%]  md:w-[60%] ">
          <div className="flex items-center mb-8">
            <div className="text-base px-2">플랫폼별 차트순위</div>
            <RxQuestionMarkCircled size={20} />
          </div>

          <TrackOverview key={cachedTrack.id} track={cachedTrack} />
        </div>

        {/* 자식2 */}
        <div className="bg-white p-6 rounded-md w-[100%]  md:w-[40%] ">
          <div className="px-2 mb-8">아티스트</div>

          {cachedTrack.artists.length > 1 ? (
            <div className="w-full flex justify-center">
              <Slider {...settings} className="w-[90%] z-[3] ">
                {cachedTrack.artists.map((artist, index) => (
                  <div key={index} className="border border-gray-300">
                    <ArtistsInfoCard artist={artist} size={100} />
                  </div>
                ))}
              </Slider>
            </div>
          ) : (
            <div className="border border-gray-300">
              <ArtistsInfoCard artist={cachedTrack.artists[0]} size={100} />
            </div>
          )}

          <PlatformAnalysisBox platforms={cachedTrack.platforms} />
        </div>
      </div>

    </div>
    )
  );
}
