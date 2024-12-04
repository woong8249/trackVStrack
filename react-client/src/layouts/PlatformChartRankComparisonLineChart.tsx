// TrackOverview.tsx (분리된 파일)
import { Line } from 'react-chartjs-2';
import TrackInfoCard from '@components/TrackInfoCard';
import { TrackWithArtistResponse } from '@typings/track';
import { MutableRefObject, ReactNode } from 'react';
import {
  lineChartOption,
  pickLabelRangeFromMultiplePlatform,
  pickXAxis,
  pickYAxis,
  verticalLinePlugin,
} from '@utils/lineChart';
import { useResponsiveChart } from '@hooks/useResponsiveChart';
import platform, { PlatformName } from '@constants/platform';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataset,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface Prob {
  children?: ReactNode
  track: TrackWithArtistResponse;
  startDate:Date
  endDate:Date
}

export default function PlatformChartRankComparisonLineChart({
  children, track, startDate, endDate,
}: Prob) {
  const commonLabels = pickLabelRangeFromMultiplePlatform(track, startDate, endDate);
  const { chartRef } = useResponsiveChart() as {chartRef :MutableRefObject< ChartJS<'line'>>};

  const chartData = {
    labels: commonLabels,
    datasets: (['melon', 'genie', 'bugs'] as PlatformName[])
      .filter((key) => !!track.platforms[key]) // 플랫폼이 존재하는 경우에만 포함
      .map((key) => {
        const value = track.platforms[key]!;
        const xAxis = pickXAxis(value, startDate, endDate);
        const yAxis = pickYAxis(value, startDate, endDate);

        // 공통 라벨에 맞춰 데이터 정렬 및 빈 값 채우기
        const data = commonLabels.map((label, index) => {
          const xValue = index; // x 값은 숫자 인덱스
          const yValue = xAxis.includes(label) ? yAxis[xAxis.indexOf(label)] : null;
          return { x: xValue, y: yValue }; // x는 number, y는 number | null로 변환
        });

        return {
          label: key,
          data,
          borderColor: platform[key].color,
          backgroundColor: platform[key].color,
        };
      }) as ChartDataset<'line'>[],
  };

  return (
    <div key={track.id.toString()} className="w-full ">
      {children}

      <div className="border-gray-300 rounded-md relative">
        <TrackInfoCard track={track} size={80} />
        <hr className="border-gray-300 mb-14" />

        <div>
          <Line
            style={{ height: '300px' }}
            ref={chartRef}
            data={chartData}
            options={lineChartOption}
            plugins={[verticalLinePlugin]}
          />
        </div>
      </div>
    </div>
  );
}
