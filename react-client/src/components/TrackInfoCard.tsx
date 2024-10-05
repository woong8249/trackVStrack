import { TrackWithArtistResponse } from '@typings/track-artist';

interface Props {
    track: TrackWithArtistResponse;
  }

export default function TrackInfoCard({ track }: Props) {
  return (
    <div className='flex justify-between items-center px-[0.5rem]'>

      <div className=' flex flex-grow items-center'>
        <img src={track.trackImage} alt='album jacket' className='w-[6rem] h-[6rem] sm:w-[8rem] sm:h-[8rem] mr-[2rem] sm:mr-[3rem]' />

        <div className='text-xs overflow-auto max-h-[5rem] flex flex-col gap-1'>
          <p className='text-[#3D3D3D] text-sm w-[15rem] sm:max-w-[20rem] sm:w-[20rem]'>{track.titleName}</p>
          <p className='text-[#9A9A9A] w-[15rem] sm:max-w-[20rem] sm:w-[20rem]'>{track.artists.map((artist) => artist.artistName).join(', ')}</p>
          <p className=' text-[#707070] w-[15rem]  sm:max-w-[20rem] sm:w-[20rem] '>{track.releaseDate ? track.releaseDate.split('T')[0] : '정보 없음'}</p>
        </div>
      </div>

    </div>
  );
}
