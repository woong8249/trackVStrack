import { Line } from 'react-chartjs-2';
import { Track } from 'src/types/track';
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
    track: Track;
  }

export default function ChartGraph({ track }: Props) {
  const labels = Object.values(track.platforms).reduce((pre, cur) => {
    if (pre.chartInfos.length < cur.chartInfos.length) {
      return cur;
    }
    return pre;
  }).chartInfos.map((info) => `${info.weekOfMonth.year}-${info.weekOfMonth.month}-${info.weekOfMonth.week}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Melon',
        data: track.platforms?.melon?.chartInfos.map((info) => info.rank),
        borderColor: '#00C73C',
        backgroundColor: '#00C73C',
      },
      {
        label: 'Genie',
        data: track.platforms?.genie?.chartInfos.map((info) => info.rank),
        borderColor: '#3498DB',
        backgroundColor: '#3498DB',
      },
      {
        label: 'Bugs',
        data: track.platforms?.bugs?.chartInfos.map((info) => info.rank),
        borderColor: '#E44C29',
        backgroundColor: '#E44C29',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${track.titleName} Weekly Chart Performance`,
      },
    },
    scales: {
      y: {
        reverse: true, // 순위를 낮은 값이 더 높게 표시되도록 (1위가 가장 위)
        title: {
          display: true,
          text: 'Rank' as const,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Week' as const,
        },
      },
    },
  };

  return (
    <Line data={chartData} options={options} className=' ' />
  );
}
