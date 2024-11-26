import 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chart.js/auto';
import {
  lineChartOption,
  pickLabelRangeLabelMultipleTrack, pickXAxis, pickYAxis,
  verticalLinePlugin,
} from '@utils/lineChart';

import { PlatformName } from '@constants/platform';
import { SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Prob {
  tracks:Omit<SelectedTrack&{track:TrackWithArtistResponse}, 'activate'>[]
  selectedPlatformName:PlatformName
  startDate:Date
  endDate:Date
}

export function TrackComparisonLineChart({
  tracks, startDate, endDate, selectedPlatformName,
}:Prob) {
  const commonLabels = pickLabelRangeLabelMultipleTrack(
    tracks.map((selectedTrack) => selectedTrack.track),
    selectedPlatformName,
    startDate,
    endDate,
  );

  const chartData = {
    labels: commonLabels,
    datasets: tracks.map((selectedTrack) => {
      const { color, track } = selectedTrack;
      const { platforms } = track;

      if (platforms[selectedPlatformName]) {
        const platform = platforms[selectedPlatformName];
        const xAxis = pickXAxis(platform, startDate, endDate);
        const yAxis = pickYAxis(platform, startDate, endDate);

        // tooltip mode index에서 길이 와 순서를 맞추기위함
        // 2. 공통 라벨과 일치하도록 데이터 정렬 및 빈 값 채우기
        const data = commonLabels.map((label) => {
          const index = xAxis.indexOf(label);
          return index !== -1 ? { x: label, y: yAxis[index] } : { x: label, y: null };
        });

        return {
          label: track.titleName,
          data,
          borderColor: color,
          backgroundColor: color,
          // yAxisID: selectedPlatformName,
        };
      }
      return null; // 선택된 플랫폼이 없는 경우 null을 반환
    }).filter((dataset) => dataset !== null),
  };

  return (
    <div className=' p-4'>
      <Line
        data={chartData}
        options={lineChartOption}
        plugins={[verticalLinePlugin]}
      />
    </div>
  );
}
