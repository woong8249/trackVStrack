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
import { HelpModal } from '../components/HelpModal';
import { MutableRefObject } from 'react';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Prob {
  tracks:Omit<SelectedTrack&{track:TrackWithArtistResponse}, 'activate'>[]
  selectedPlatformName:PlatformName
  startDate:Date
  endDate:Date
}

export function TrackChartRankComparisonLineChart({
  tracks, startDate, endDate, selectedPlatformName,
}:Prob) {
  const { chartRef } = useResponsiveChart() as {chartRef :MutableRefObject<ChartJS<'line', { x: number; y: number | null }[]>> };
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
        const data = commonLabels.map((label, index) => {
          const xValue = index; // x 값은 숫자 인덱스
          const yValue = xAxis.includes(label) ? yAxis[xAxis.indexOf(label)] : null;
          return { x: xValue, y: yValue }; // x는 number, y는 number | null로 변환
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
    }).filter((dataset) => dataset !== null) as ChartDataset<'line', { x: number; y: number | null }[]>[],
  };

  return (
    <div className='py-8'>
      <div className="flex mb-6 px-8 pb-14">
        <div className='flex items-center px-2 gap-2'>
          <div>📉 트랙 간의 차트 순위 비교</div>

          <HelpModal >
            <h2 id="chart-comparison-title" className="mb-4 text-lg font-semibold text-gray-700">
              📉 트랙 간의 차트 순위 비교
            </h2>

            <section id="chart-comparison-description" className="text-gray-500 space-y-3">
              <p>
                여러 트랙의
                {' '}
                <strong className="text-gray-800">주간 차트 순위</strong>
                {' '}
                변동을 한눈에 확인해 보세요.
              </p>

              <p>
                <strong className="text-gray-800">범례 항목</strong>
                을 클릭하여 원하는 데이터를 숨기거나 다시 표시할 수 있습니다.
              </p>

              <p>
                <strong className="text-gray-800">좌측 상단</strong>
                {' '}
                달력 버튼을 통해 특정 기간을 필터링할 수 있습니다.
              </p>

              <p>
                <strong className="text-gray-800">우측 상단</strong>
                {' '}
                플랫폼 버튼을 통해 플랫폼을 선택할 수 있습니다.
              </p>
            </section>
          </HelpModal>
        </div>

      </div>

      <div className=' p-4'>
        <Line
        style={{ height: '300px' }}
        ref={chartRef}
        data={chartData}
        options={lineChartOption}
        plugins={[verticalLinePlugin]}
        />
      </div>
    </div>
  );
}
