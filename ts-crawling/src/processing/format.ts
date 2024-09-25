import type { FetchWeeklyChartResult } from 'src/types/fetch';
import type { TrackFormatWithoutAddInfo, Platform } from 'src/types/processing';

export function convertWeeklyChartToTrackFormat(
  chartOrCharts: FetchWeeklyChartResult[] | FetchWeeklyChartResult,
): TrackFormatWithoutAddInfo[] | TrackFormatWithoutAddInfo {
  const charts = Array.isArray(chartOrCharts) ? chartOrCharts : [chartOrCharts];
  const formattedTracks = charts.map((chart) => {
    const { platform, chartScope, chartDetails } = chart;

    const tracks = chartDetails.map((chartDetail) => {
      const { rank, ...rest } = chartDetail;
      const platformData: Platform = {
        ...rest,
        weeklyChartScope: [{
          ...(chartScope),
          rank,
        }],
      };

      const trackFormat: TrackFormatWithoutAddInfo = {
        trackKeyword: chartDetail.titleKeyword,
        [platform]: platformData,
      };

      return trackFormat;
    });
    return tracks;
  }).flat();

  const result = Array.isArray(chartOrCharts) ? formattedTracks : formattedTracks[0] as TrackFormatWithoutAddInfo;

  return result;
}
