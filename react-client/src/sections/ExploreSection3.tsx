import { SelectedTrack } from '@pages/ExplorePage';
import { PlatformComparisonContainer } from '@layouts/PlatformComparisonContainer';

interface Prob{
    selectedTracks: SelectedTrack[]; // 상태
}

export default function ExploreSection3({ selectedTracks }:Prob) {
  return (
    <section className=" mt-[5rem] w-[100%] md:w-[90%] lg:w-[80%] text-gray-700">
      {selectedTracks.map((selectedTrack) => {
        if (selectedTrack.track) {
          return (
            <PlatformComparisonContainer key={selectedTrack.id} selectedTrack={selectedTrack} />
          );
        }
        return null;
      })}
    </section>
  );
}
