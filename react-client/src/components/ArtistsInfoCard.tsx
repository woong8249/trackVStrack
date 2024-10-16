import { ArtistResponse } from '@typings/artist';
import { Link } from 'react-router-dom';

interface Props {
    artist: ArtistResponse ;
  }

export default function ArtistsInfoCard({ artist }: Props) {
  if (artist.artistImage === 'missing') {
    // 해야함
  }
  return (
    <div className="flex justify-between items-center px-[0.5rem] group">

      <div className="flex flex-grow items-center overflow-x-auto">
        <img src={artist.artistImage} alt='artist profile img' className="w-[100px] h-[100px]  mr-[2rem] sm:mr-[3rem]" />

        <div className="text-xs max-h-[5rem] flex flex-col gap-1 overflow-x-auto whitespace-nowrap min-w-[150px] sm:min-w-[200px] md:min-w-[300px] lg:min-w-[330px]">
          <Link
            to={{ pathname: '/artist' }}
            state={{ artist }}
            className="text-[#3D3D3D] whitespace-nowrap responsive-small-text font-bold group-hover:underline"
          >
            <p>{artist.artistName}</p>
          </Link>

          <p className=' text-[#707070]  responsive-extra-small-text '>{artist.debut !== 'missing' ? artist.debut : ''}</p>
        </div>

      </div>

    </div>
  );
}
