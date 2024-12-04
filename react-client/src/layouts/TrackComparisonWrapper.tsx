import { TrackRankComparisonLineChart } from '@layouts/TrackRankComparisonLineChart';
import { PlatformName } from '@constants/platform';
import { SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import { TrackChartInDurationComparisonBarChart } from '@layouts/TrackChartInDurationComparisonBarChart';
import { TrackChartPerformanceRankingHorizontalBarChart } from '@layouts/TrackChartPerformanceRankingHorizontalBarChart';

interface Prob {
    selectedTracks:SelectedTrack[]
    selectedPlatformName:PlatformName
    startDate:Date
    endDate:Date
  }

export function TrackComparisonWrapper({
  selectedTracks, startDate, endDate, selectedPlatformName,
}:Prob) {
  const isTrackWithArtistResponse = (
    selectedTrack: SelectedTrack,
  ): selectedTrack is SelectedTrack & { track: TrackWithArtistResponse } => (selectedTrack.track as TrackWithArtistResponse)?.titleName !== undefined;

  const fSelectedTracks = selectedTracks.filter(isTrackWithArtistResponse);
  return (
    <>
      {/* contents1 */}
      <div className='w-full bg-white rounded-md mb-4'>
        <TrackChartPerformanceRankingHorizontalBarChart
            tracks={fSelectedTracks}
            selectedPlatformName={selectedPlatformName}
            startDate={startDate}
            endDate={endDate}
        />

      </div>

      <div className='flex w-full gap-2 flex-col  lg:flex-row  mb-4'>
        {/* contents2 */}
        <div className='w-full lg:w-[70%] bg-white rounded-md  '>
          <TrackRankComparisonLineChart
          tracks={fSelectedTracks}
          selectedPlatformName={selectedPlatformName}
          startDate={startDate}
          endDate={endDate} />
        </div>

        {/* contents3 */}
        <div className='w-full lg:w-[30%] bg-white rounded-md '>
          <TrackChartInDurationComparisonBarChart
            tracks={fSelectedTracks}
            selectedPlatformName={selectedPlatformName}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>

    </>
  );
}
