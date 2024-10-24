import { ArtistResponse } from '@typings/artist';
import { RxAvatar } from 'react-icons/rx';
// import { Link } from 'react-router-dom';

interface Props {
    artist: ArtistResponse ;
    size?:number
  }

export default function ArtistsInfoCard({ artist, size = 100 }: Props) {
  return (
    <div className="flex justify-between items-center px-[0.5rem] overflow-x-auto">
      <div className="flex flex-grow items-center">
        {artist.artistImage === 'missing'
          ? <RxAvatar className={`w-[${size}px] h-[${size}px]  mr-[2rem] sm:mr-[3rem]`} />
          : (
            <img
              src={artist.artistImage}
              alt='artist profile img'
              style={{ width: `${size}px`, height: `${size}px` }} // 인라인 스타일로 적용
              className="mr-[2rem] sm:mr-[3rem]"
              />
          )}

        <div className="text-xs max-h-[5rem] flex flex-col gap-1 overflow-x-auto whitespace-nowrap min-w-[150px] sm:min-w-[200px] md:min-w-[300px] lg:min-w-[330px]">
          <p className="text-[#3D3D3D] whitespace-nowrap responsive-small-text font-bold ">{artist.artistName}</p>
          <p className=' text-[#707070]  responsive-extra-small-text '>{artist.debut !== 'missing' ? artist.debut : ''}</p>
        </div>

      </div>

    </div>
  );
}
