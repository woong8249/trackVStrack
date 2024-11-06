import { TrackComparisonContainer } from '@layouts/TrackComparisonContainer';
import { TrackWithArtistResponse } from '@typings/track';
import sampleTracks from '@constants/sample.json';

export interface SelectedTrack {
  id: number;
  activate: boolean;
  track: TrackWithArtistResponse;
  color: string;
}

export default function ExploreSection2() {
  const selectedTracks = sampleTracks as SelectedTrack[];
  return (
    <section className="mt-[5rem] w-[100%] md:w-[90%] lg:w-[80%] text-gray-700">
      <TrackComparisonContainer selectedTracks ={selectedTracks} />
    </section>
  );
}
