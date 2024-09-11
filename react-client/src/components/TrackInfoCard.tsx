import { Track } from 'src/types/track';

interface Props {
    track: Track;
  }

export default function TrackInfoCard({ track }: Props) {
  return (
    <div className='flex justify-between items-center px-[0.5rem]'>

      <div className='flex items-center'>
        <img src={track.trackImage} alt='album jacket' className='w-[8rem] h-[8rem] sm:w-[10rem] sm:h-[10rem] mr-[2rem] sm:mr-[3rem]' />

        <div className='text-xs sm:text-sm  overflow-auto max-h-[5rem]'>
          <div className='flex'>
            <span className='text-white font-bold flex-shrink-0'>Title Name&nbsp;:&nbsp;</span>
            <span className='text-white w-[15rem] sm:max-w-[20rem] sm:w-[20rem]'>{track.titleName}</span>
          </div>

          <div className='flex'>
            <span className='text-white font-bold flex-shrink-0'>Artist Name&nbsp;:&nbsp;</span>
            <span className='text-white w-[15rem] sm:max-w-[20rem] sm:w-[20rem]'>{track.artists.map((artist) => artist.artistName).join(', ')}</span>
          </div>

          <div className='flex'>
            <span className='text-white  font-bold flex-shrink-0'>Release Date&nbsp;:&nbsp;</span>
            <span className='text-white  w-[15rem]  sm:max-w-[20rem] sm:w-[20rem] '>{track.releaseDate.split('T')[0]}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
