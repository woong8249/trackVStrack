import { TrackComparisonContainer } from '@layouts/TrackComparisonContainer';
import { SelectedTrack } from '@pages/ExplorePage';

interface Prob{
  selectedTracks: SelectedTrack[]; // 상태 값
}

export default function ExploreSection2({
  selectedTracks,
}:Prob) {
  return (
    <section className="mt-[5rem] w-[100%] md:w-[90%] lg:w-[80%] text-gray-700">
      <TrackComparisonContainer selectedTracks ={selectedTracks} />
    </section>
  );
}
