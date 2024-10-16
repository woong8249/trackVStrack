/* eslint-disable max-len */
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
  ChartOptions,
} from 'chart.js';
import { Platform, TrackResponse } from '@typings/track';
import WeekRangePicker from '@components/WeekRangePicker';
import { useState } from 'react';
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
  }

export default function ChartGraph({ track }: Props) {
  const { platforms } = track;
  const availablePlatforms = [platforms?.bugs, platforms?.genie, platforms?.melon].filter(Boolean) as Platform[];
  const startDates: string[] = availablePlatforms.map(
    (platform) => platform.weeklyChartScope[0].startDate,
  ).filter(Boolean) as string[];

  const endDates: string[] = availablePlatforms.map(
    (platform) => platform.weeklyChartScope[platform.weeklyChartScope.length - 1]?.endDate,
  ).filter(Boolean) as string[];

  const [startDate, setStartDate] = useState<Date>(new Date(Math.min(...startDates.map((date) => new Date(date).getTime()))));
  const [endDate, setEndDate] = useState<Date>(new Date(Math.max(...endDates.map((date) => new Date(date).getTime()))));
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const labels = Array.from(
    new Set(
      Object.values(track.platforms)
        .flatMap((platform) => platform.weeklyChartScope.filter((scope) => {
          const { startDate: _startDate, endDate: _endDate } = scope;
          return new Date(_startDate) >= startDate && new Date(_endDate) <= endDate;
        }).map((info) => `${info.weekOfMonth.year}-${info.weekOfMonth.month}-${info.weekOfMonth.week}`)),
    ),
  ).sort((a, b) => {
    const [aYear, aMonth, aWeek] = a.split('-').map(Number);
    const [bYear, bMonth, bWeek] = b.split('-').map(Number);

    if (aYear !== bYear) return aYear - bYear;
    if (aMonth !== bMonth) return aMonth - bMonth;
    return aWeek - bWeek;
  });

  const chartData: { labels: string[], datasets: ChartDataset<'line'>[] } = {
    labels,
    datasets: [],
  };

  if (track.platforms?.melon) {
    chartData.datasets.push({
      label: 'Melon',
      data: track.platforms.melon.weeklyChartScope
        .filter((scope) => {
          const { startDate: _startDate, endDate: _endDate } = scope;
          return new Date(_startDate) >= startDate && new Date(_endDate) <= endDate;
        })
        .map((info) => Number(info.rank)),
      borderColor: '#00C73C',
      backgroundColor: '#00C73C',
    });
  }

  if (track.platforms?.genie) {
    chartData.datasets.push({
      label: 'Genie',
      data: track.platforms.genie.weeklyChartScope
        .filter((scope) => {
          const { startDate: _startDate, endDate: _endDate } = scope;
          return new Date(_startDate) >= startDate && new Date(_endDate) <= endDate;
        })
        .map((info) => Number(info.rank)),
      borderColor: '#3498DB',
      backgroundColor: '#3498DB',
    });
  }

  if (track.platforms?.bugs) {
    chartData.datasets.push({
      label: 'Bugs',
      data: track.platforms.bugs.weeklyChartScope
        .filter((scope) => {
          const { startDate: _startDate, endDate: _endDate } = scope;
          return new Date(_startDate) >= startDate && new Date(_endDate) <= endDate;
        })
        .map((info) => Number(info.rank)),
      borderColor: '#E44C29',
      backgroundColor: '#E44C29',
    });
  }
  const options :ChartOptions<'line'> = {
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${track.titleName} Weekly Chart Performance`,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const item = tooltipItems[0];
            const [year, month, week] = item.label.split('-');
            return `${year}년 ${month}월 ${week}주차`;
          },
          label: (tooltipItem) => {
            const datasetLabel = tooltipItem.dataset.label || '';
            const rank = tooltipItem.raw as number;
            return `${datasetLabel}: rank ${rank}`;
          },
        },
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

    <div className="chart-container">
      <WeekRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />

      <Line data={chartData} options={options} />
    </div>
  );
}
