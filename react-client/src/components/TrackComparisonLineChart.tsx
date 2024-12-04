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
  ChartData,
  ChartDataset,
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
import { useResponsiveChart } from '@hooks/useResponsiveChart';
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
  const { chartRef } = useResponsiveChart();
  const commonLabels = pickLabelRangeLabelMultipleTrack(
    tracks.map((selectedTrack) => selectedTrack.track),
    selectedPlatformName,
    startDate,
    endDate,
  );

  const chartData :ChartData<'line'> = {
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
        const data = commonLabels.map((label, index) => {
          const xValue = index; // x 값은 숫자 인덱스
          const yValue = xAxis.includes(label) ? yAxis[xAxis.indexOf(label)] : null;
          return { x: xValue, y: yValue }; // x와 y를 숫자로 설정
        });

        return {
          label: track.titleName,
          data: data as { x: number; y: number | null }[], // 타입 캐스팅
          borderColor: color,
          backgroundColor: color,
          // yAxisID: selectedPlatformName,
        };
      }
      return null; // 선택된 플랫폼이 없는 경우 null을 반환
    }).filter((dataset) => dataset !== null) as ChartDataset<'line'>[],
  };

  return (
    <div className=' p-4'>
      <Line
        style={{ height: '300px' }}
        ref={chartRef}
        data={chartData}
        options={lineChartOption}
        plugins={[verticalLinePlugin]}
      />
    </div>
  );
}
