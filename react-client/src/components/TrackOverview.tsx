/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useModal } from '@hooks/useModal';
import ChartGraph from './ChartGraph';
import TrackInfoCard from './TrackInfoCard';
import { TrackWithArtistResponse } from '@typings/track-artist';

interface Props {
  track: TrackWithArtistResponse;
  isLargeViewport: boolean;
}

export default function TrackOverview({ track, isLargeViewport }: Props) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();

  return (
    <div
    className="border-[1px] border-[#9A9A9A] rounded-md hover:bg-gray-200 transition cursor-pointer shadow-2xl"
    onClick={() => { setIsModalOpen(!isModalOpen); }}
    role="button"
    tabIndex={0}
    >
      <TrackInfoCard track={track} />

      {isLargeViewport && (
        <>
          <div className="border-b-[1px] border-[#9A9A9A] mb-[1rem]"></div>
          <ChartGraph track={track} />
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-15">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto"
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
            >
            <div className="w-[50rem] sm:w-[70rem] overflow-auto">
              <TrackInfoCard track={track} />
              <div className="border-b-[1px] border-[#9A9A9A] mb-[1rem]"></div>
              <ChartGraph track={track} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
