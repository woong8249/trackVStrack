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
  ChartOptions,
} from 'chart.js';
import { TrackResponse } from '@typings/track';
import platform, { PlatformName } from '@constants/platform';
import {
  pickLabelRangeFromMultiplePlatform, pickXAxis, pickYAxis, verticalLinePlugin,
} from '@utils/lineChart';

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

export default function ChartGraph({
  track, startDate, endDate,
}: Props) {
  const labels = pickLabelRangeFromMultiplePlatform(track, startDate, endDate);
  const chartData = {
    labels,
    datasets: Object.entries(track.platforms).map(([key, value]) => {
      const xAxis = pickXAxis(value, startDate, endDate);
      const yAxis = pickYAxis(value, startDate, endDate);
      return {
        label: key,
        data: xAxis.map((x, index) => ({
          x,
          y: yAxis[index],
        })),
        borderColor: platform[key as PlatformName].color,
        backgroundColor: platform[key as PlatformName].color,
      };
    }),
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            const item = tooltipItems[0];
            const [year, month, week] = item.label.split('-');
            return `${year}년 ${month}월 ${week}주차`;
          },
          label: (tooltipItem) => {
            const datasetLabel = tooltipItem.dataset.label || '';
            const rank = tooltipItem.formattedValue;
            return `${datasetLabel}: ${rank}위`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Week' as const,
        },
        grid: {
          display: false,
        },
      },
      y: {
        reverse: true,
        min: 1,
        max: 100,
        title: {
          display: true,
          text: 'Rank' as const,
        },

      },
    },
  };

  return (

    <div>
      <Line data={chartData} options={options} plugins={[verticalLinePlugin]} />
    </div>
  );
}
