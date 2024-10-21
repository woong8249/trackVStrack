// import { Link } from 'react-router-dom';
import { TrackWithArtistResponse } from '@typings/track';

interface Props {
  track: TrackWithArtistResponse;
  size?:number
}

export default function TrackInfoCard({ track, size = 100 }: Props) {
  return (
    <div className="flex justify-between items-center px-[0.5rem] ">
      <div className="flex flex-grow items-center overflow-x-auto">
        <img
          src={track.trackImage}
          alt="album jacket"
          className={`w-[${size}px] h-[${size}px]  mr-[2rem] sm:mr-[3rem]`}
        />

        <div className="text-xs max-h-[5rem] flex flex-col gap-1 overflow-x-auto whitespace-nowrap min-w-[150px] sm:min-w-[200px] md:min-w-[300px] lg:min-w-[330px]">
          <p className="text-gray-600 whitespace-nowrap responsive-small-text font-bold">{track.titleName}</p>

          <div className="whitespace-nowrap overflow-x-auto">
            {track.artists.map((artist, index) => (
              <span key={track.id}>
                {artist.artistName}
                {index !== track.artists.length - 1 && ', '}
              </span>
            ))}
          </div>

          {/* 날짜 표시 부분도 줄바꿈 없이 처리 */}
          <p className="text-[#707070] responsive-extra-small-text whitespace-nowrap">
            {track.releaseDate ? track.releaseDate.split('T')[0] : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
