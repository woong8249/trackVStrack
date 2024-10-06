import { ArtistResponse } from '@typings/artist';

interface Props {
    artist: ArtistResponse ;
  }

export default function ArtistsInfoCard({ artist }: Props) {
  if (artist.artistImage === 'missing') {
    // 해야함
  }
  return (
    <div className='flex justify-between items-center px-[0.5rem]'>

      <div className=' flex flex-grow items-center'>
        <img src={artist.artistImage} alt='artist profile img' className='w-[6rem] h-[6rem] sm:w-[8rem] sm:h-[8rem] mr-[2rem] sm:mr-[3rem]' />

        <div className='text-xs overflow-auto max-h-[5rem] flex flex-col gap-1'>
          <p className='text-[#3D3D3D]   w-[15rem] sm:max-w-[20rem] sm:w-[20rem] responsive-small-text'>{artist.artistName}</p>
          <p className=' text-[#707070]  responsive-extra-small-text '>{artist.debut ? artist.debut : '정보 없음'}</p>
        </div>

      </div>

    </div>
  );
}
