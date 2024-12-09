import ArtistsInfoCard from '@components/ArtistsInfoCard';
import { NextArrow, PrevArrow } from '@components/SliderArrows';
import { TrackWithArtistResponse } from '@typings/track';
import Slider from 'react-slick';

interface Prob {
    track:TrackWithArtistResponse
}

const settings = {
  dots: true,
  infinite: true,
  lazyLoad: 'progressive' as const,
  speed: 800,
  slidesToScroll: 1,
  slidesToShow: 1,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
  draggable: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        arrows: false,
        draggable: true,
      },
    },
  ],
};

export function ArtistsBox({ track }:Prob) {
  return (
    <div className='bg-white px-6 pb-6 rounded-md '>
      <div className="px-2 py-7">🎤 아티스트</div>

      {track.artists.length > 1 ? (
        <div className="w-full flex justify-center">
          <Slider {...settings} className="w-[90%] z-[3] px-4 ">
            {track.artists.map((artist, index) => (
              <div key={index} >
                <ArtistsInfoCard artist={artist} size={80} />
                <hr></hr>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        <div >
          <ArtistsInfoCard artist={track.artists[0]} size={80} />
          <hr></hr>
        </div>
      )}

    </div>
  );
}
