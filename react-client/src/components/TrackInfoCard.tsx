import { TrackWithArtistResponse } from '@typings/track-artist';
import { Link } from 'react-router-dom';

interface Props {
  track: TrackWithArtistResponse | Omit<TrackWithArtistResponse, 'artists'>;
}

export default function TrackInfoCard({ track }: Props) {
  return (
    <div className="flex justify-between items-center px-[0.5rem] group">
      <div className="flex flex-grow items-center">
        <img
          src={track.trackImage}
          alt="album jacket"
          className="w-[6rem] h-[6rem] sm:w-[8rem] sm:h-[8rem] mr-[2rem] sm:mr-[3rem]"
        />

        {('artists' in track && track.artists) ? (
          <div className="text-xs overflow-auto max-h-[5rem] flex flex-col gap-1">
            <Link
              to={{ pathname: '/track' }}
              state={{ track }}
              className="text-[#3D3D3D] w-[15rem] sm:max-w-[20rem] sm:w-[20rem] responsive-small-text font-bold group-hover:underline"
            >
              <p>{track.titleName}</p>
            </Link>

            {track.artists.map((artist) => (
              <Link
                key={artist.id}
                to={{ pathname: '/artist' }}
                state={{ artist }}
                className="text-[#9A9A9A] responsive-extra-small-text font-bold cursor-pointer"
              >
                {artist.artistName}
              </Link>
            ))}

            <p className="text-[#707070] responsive-extra-small-text">
              {track.releaseDate ? track.releaseDate.split('T')[0] : '정보 없음'}
            </p>
          </div>
        ) : (
          <div className="text-xs overflow-auto max-h-[5rem] flex flex-col gap-1">
            <Link
              to={{ pathname: '/track' }}
              state={{ track }}
              className="text-[#3D3D3D] w-[15rem] sm:max-w-[20rem] sm:w-[20rem] responsive-small-text font-bold group-hover:underline"
            >
              <p>{track.titleName}</p>
            </Link>

            <p className="text-[#707070] responsive-extra-small-text">
              {track.releaseDate ? track.releaseDate.split('T')[0] : '정보 없음'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
