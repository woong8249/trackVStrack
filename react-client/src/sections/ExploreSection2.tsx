import { SelectedTrack } from '@pages/ExplorePage';
import { PlatformAnalysisContainer } from '@layouts/PlatformAnalysisContainer';

interface Prob{
    selectedTracks: SelectedTrack[]; // 상태
}

export default function ExploreSection2({ selectedTracks }:Prob) {
  return (
    <section className="flex flex-wrap gap-2 items-center justify-center mt-[5rem] text-gray-700 w-[100%] md:w-[90%] lg:w-[80%]">
      {selectedTracks.map((selectedTrack) => {
        if (selectedTrack.track) {
          return (
            <PlatformAnalysisContainer key={selectedTrack.id} selectedTrack={selectedTrack} />
          );
        }
        return null;
      })}
    </section>
  );
}
