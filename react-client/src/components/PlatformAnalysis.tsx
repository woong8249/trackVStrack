/* eslint-disable no-nested-ternary */
/* eslint-disable max-len */
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  TooltipItem,
} from 'chart.js';
import { Platform } from '@typings/track';
import { PlatformName } from './PlatformAnalysisBox';

// Chart.js에서 필요한 요소들을 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Prob {
  platformName:PlatformName
    melon?:Platform
    genie?:Platform
    bugs?:Platform
}

export default function PlatformAnalysis({
  melon, genie, bugs, platformName,
}: Prob) {
  const targetPlatform = melon || genie || bugs as Platform;
  const color = platformName === 'melon'
    ? '#00C73C'
    : platformName === 'genie'
      ? '#3498DB'
      : '#E44C29';

  // 차트 데이터 계산 함수
  const totalChartWeeks = targetPlatform.weeklyChartScope.length;
  const countRange = (minRank: number, maxRank: number) => targetPlatform.weeklyChartScope.filter((scope) => {
    const rank = parseInt(scope.rank, 10);
    return rank >= minRank && rank <= maxRank;
  }).length;

  const chartData = {
    labels: ['차트인 기간', '1~25위', '26~50위', '51~75위', '76~100위'],
    datasets: [
      {
        label: `${platformName} 차트 분석`,
        data: [
          totalChartWeeks,
          countRange(1, 25),
          countRange(26, 50),
          countRange(51, 75),
          countRange(76, 100),
        ],
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: '플랫폼 차트 분석',
      },
      tooltip: {
        callbacks: {
          label(context: TooltipItem<'bar'>) {
            const label = context.label || '';
            const value = context.raw || 0;
            let tooltipText = '';

            // 각 label별 커스텀 텍스트 정의
            switch (label) {
              case '차트인 기간':
                tooltipText = `차트인 기간: ${value}주`;
                break;
              case '1~25위':
                tooltipText = `1~25위 횟수: ${value}`;
                break;
              case '26~50위':
                tooltipText = `26~50위 횟수: ${value}`;
                break;
              case '51~75위':
                tooltipText = `51~75위 횟수: ${value}`;
                break;
              case '76~100위':
                tooltipText = `76~100위 횟수: ${value}`;
                break;
              default:
                tooltipText = `${label}: ${value}`;
            }
            return tooltipText;
          },
        },
      },
    },
  };

  // 차트 컴포넌트 렌더링
  return (
    <div className="w-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
