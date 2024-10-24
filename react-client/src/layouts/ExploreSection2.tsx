import ArtistsInfoCard from '@components/ArtistsInfoCard';
import PlatformAnalysisBox from '@components/type2/PlatformAnalysisBox';
import TrackOverview from '@components/type2/TrackOverview';
import { SelectedTrack } from '@pages/ExplorePage';
import { IoIosArrowRoundBack, IoIosArrowRoundForward } from 'react-icons/io';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import Slider, { CustomArrowProps } from 'react-slick';

interface Prob{
    selectedTracks: SelectedTrack[]; // 상태
}

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

export default function ExploreSection2({ selectedTracks }:Prob) {
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

  return (
    <section className="flex flex-wrap gap-4 items-center justify-center mt-[5rem] w-[90%] text-gray-700">
      {selectedTracks.map((selectedTrack) => {
        if (selectedTrack.track) {
          return (
            <div key={selectedTrack.id} className='mb-8'>
              <div className='text-lg mb-4'>{selectedTrack.track.titleName}</div>

              <div className='flex gap-4'>
                <div className='bg-white p-6 rounded-lg'>
                  <div className='flex items-center mb-8 '>
                    <div className='text-base px-2'>플랫폼별 차트순위</div>
                    <RxQuestionMarkCircled size={20} />
                  </div>

                  <TrackOverview key={selectedTrack.id} track={selectedTrack.track} />
                </div>

                <div className=''>
                  <div className='bg-white p-6 rounded-lg mb-4'>
                    <div className='px-2 mb-8'>아티스트</div>

                    {selectedTrack.track.artists.length > 1 ? (
                      <div className='w-full'>
                        <Slider {...settings} className="w-[31rem] ">
                          {selectedTrack.track.artists.map((artist) => (
                            <div className='border border-gray-300 '>
                              <ArtistsInfoCard artist={artist} size={100} />
                            </div>
                          ))}
                        </Slider>
                      </div>
                    ) : (
                      <div className='border border-gray-300'>
                        <ArtistsInfoCard artist={selectedTrack.track.artists[0]} size={100} />
                      </div>
                    )}

                  </div>

                  <PlatformAnalysisBox platforms={selectedTrack.track.platforms} />
                </div>

              </div>

            </div>
          );
        }
        return null;
      })}
    </section>
  );
}
