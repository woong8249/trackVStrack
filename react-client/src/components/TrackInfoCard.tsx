import { TrackWithArtistResponse } from '@typings/track';
import { Link } from 'react-router-dom';

interface Props {
  track: TrackWithArtistResponse;
}

export default function TrackInfoCard({ track }: Props) {
  return (
    <div className="flex justify-between items-center px-[0.5rem] ">
      <div className="flex flex-grow items-center overflow-x-auto">
        {/* 부모 요소에도 overflow-x-auto를 추가합니다 */}
        <img
          src={track.trackImage}
          alt="album jacket"
          className="w-[100px] h-[100px]  mr-[2rem] sm:mr-[3rem]"
        />

        {/* 텍스트 컨테이너에 최소 크기 설정 */}
        <div className="text-xs max-h-[5rem] flex flex-col gap-1 overflow-x-auto whitespace-nowrap min-w-[150px] sm:min-w-[200px] md:min-w-[300px] lg:min-w-[330px]">
          {/* 제목이 줄바꿈 없이 스크롤 가능하게 설정 */}
          <Link
            to={{ pathname: '/track' }}
            state={{ track }}
            className="text-[#3D3D3D] whitespace-nowrap responsive-small-text font-bold hover:underline"
          >
            <p>{track.titleName}</p>
          </Link>

          {/* 아티스트 리스트 부분을 한 줄로 만들고 좌우 스크롤 가능하게 설정 */}
          <div className="whitespace-nowrap overflow-x-auto">
            {track.artists.map((artist, index) => (
              <Link
                key={artist.id}
                to={{ pathname: '/artist' }}
                state={{ artist }}
                className="text-[#9A9A9A] responsive-extra-small-text font-bold cursor-pointer inline-block hover:underline"
              >
                <span>
                  {artist.artistName}
                  {index !== track.artists.length - 1 && ', '}
                </span>
              </Link>
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
