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
import { TrackResponse } from '@typings/track';
import platform, { PlatformName } from '@constants/platform';
import {
  lineChartOption,
  pickLabelRangeFromMultiplePlatform, pickXAxis, pickYAxis, verticalLinePlugin,
} from '@utils/lineChart';
import { useResponsiveChart } from '@hooks/useResponsiveChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface Props {
    track: TrackResponse;
    startDate:Date
    endDate:Date
  }

export default function PlatformCompareLineChart({
  track, startDate, endDate,
}: Props) {
  const commonLabels = pickLabelRangeFromMultiplePlatform(track, startDate, endDate);
  const { chartRef } = useResponsiveChart();

  const chartData = {
    labels: commonLabels,
    datasets: (['melon', 'genie', 'bugs'] as PlatformName[])
      .filter((key) => !!track.platforms[key]) // 플랫폼이 존재하는 경우에만 포함
      .map((key) => {
        const value = track.platforms[key]!;
        const xAxis = pickXAxis(value, startDate, endDate);
        const yAxis = pickYAxis(value, startDate, endDate);

        // 공통 라벨에 맞춰 데이터 정렬 및 빈 값 채우기
        const data = commonLabels.map((label) => {
          const index = xAxis.indexOf(label);
          return index !== -1 ? { x: label, y: yAxis[index] } : { x: label, y: null };
        });

        return {
          label: key,
          data,
          borderColor: platform[key].color,
          backgroundColor: platform[key].color,
        };
      }),
  };

  return (
    <div className='mt-2 p-4 '>
      <Line
      style={{ height: '300px' }}
        ref={chartRef}
        data={chartData}
        options={lineChartOption}
        plugins={[verticalLinePlugin]} />
    </div>
  );
}
