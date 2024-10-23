// import { Link } from 'react-router-dom';
import { TrackWithArtistResponse } from '@typings/track';

interface Props {
  track: TrackWithArtistResponse;
  size?:number
}

export default function TrackInfoCard({ track, size = 100 }: Props) {
  return (
    <div className="flex justify-between items-center px-[0.5rem] overflow-x-auto">
      <div className="flex flex-grow items-center">
        <img
          src={track.trackImage}
          alt="album jacket"
          style={{ width: `${size}px`, height: `${size}px` }} // 인라인 스타일로 적용
          className="mr-[2rem] sm:mr-[3rem]"
        />

        <div className="text-xs max-h-[5rem] flex flex-col gap-1 overflow-x-auto whitespace-nowrap w-full">
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
