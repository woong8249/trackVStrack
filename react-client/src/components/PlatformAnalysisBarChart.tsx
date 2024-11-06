import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  TooltipItem,
  ChartOptions,
} from 'chart.js';
import { Platform } from '@typings/track';

import { useModal } from '@hooks/useModal';
import { useState } from 'react';
import platform, { PlatformName } from '@constants/platform';
import { countRange, isWithinDateRange } from '@utils/barChart';

// Chart.js에서 필요한 요소들을 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Prob {
  platformName:PlatformName
  melon?:Platform
  genie?:Platform
  bugs?:Platform
  startDate:Date
  endDate:Date
}

export default function PlatformAnalysisBarChart({
  melon, genie, bugs, platformName, startDate, endDate,
}: Prob) {
  const targetPlatform = melon || genie || bugs as Platform;
  const { isModalOpen, setIsModalOpen } = useModal();
  const initialRanges = [[1, 25], [26, 50], [51, 75], [76, 100]];
  const [ranges, setRanges] = useState(initialRanges);

  const filteredChartWeeks = targetPlatform.weeklyChartScope.filter((scope) => isWithinDateRange(scope, startDate, endDate));
  const totalChartWeeks = filteredChartWeeks.length;

  const chartData = {
    labels: ['총 차트인 기간', ...ranges.map((range) => `${range[0]}~${range[1]}위`)],
    datasets: [
      {
        label: `${platformName} 차트`,
        data: [
          totalChartWeeks,
          ...ranges.map(([min, max]) => countRange(filteredChartWeeks, min, max)),
        ],
        backgroundColor: platform[platformName].color,
        borderColor: platform[platformName].color,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions:ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      // y: {
      //   grid: {
      //     display: true,
      //   },
      // },
    },
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
            if (label === '총 차트인 기간') return `총 차트인 기간: ${value}주`;
            // 범위 기반의 동적 툴팁 텍스트 생성
            const rangeIndex = chartData.labels.indexOf(label) - 1; // '총 차트인 기간'이 첫 번째 항목이므로 -1
            if (rangeIndex >= 0 && ranges[rangeIndex]) {
              const [min, max] = ranges[rangeIndex];
              return `${min}~${max}위 횟수: ${value}`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={(e) => { e.stopPropagation(); setIsModalOpen((pre) => !pre); }}
          className="px-2 py-2 border border-gray-500 text-xs rounded-md hover:bg-gray-300 transition-colors"
        >
          범위 설정
        </button>
      </div>

      {isModalOpen && (
      <div className="modal">

        {ranges.map((range, index) => (
          <div className='px-2 py-2 text-[14px] mb-4 border rounded-md '>
            <div className='px-1 py-1 mb-2 font-semibold'>
              {index + 1}
              번
            </div>

            <div key={index} className="flex gap-2">
              <div className="w-full max-w-sm m-w-[150px]">
                <label className="px-2 block mb-1 text-xs text-slate-600">
                  {'최소 순위'}
                </label>

                <div className="relative">
                  <select
                  value={range[0]}
                  onChange={(e) => {
                    const newRanges = [...ranges];
                    newRanges[index][0] = parseInt(e.target.value, 10);
                    if (newRanges[index][1] <= newRanges[index][0]) {
                      newRanges[index][1] = newRanges[index][0] + 1; // 시작 값보다 큰 값으로 설정
                    }
                    setRanges(newRanges);
                  }}
                  className={
                    `w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 
                  transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow cursor-pointer appearance-none`}
                >
                    {[...Array(100)].map((_, i) => (
                      <option key={i} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>

                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.2"
                  stroke="currentColor"
                  className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75L15.75 15m-7.5-6L12 5.25L15.75 9" />
                  </svg>
                </div>
              </div>

              <div className="w-full max-w-sm m-w-[150px]">
                <label className="px-2 block mb-1 text-xs text-slate-600">
                  {'최대 순위'}
                </label>

                <div className="relative">
                  <select
                  value={range[1]}
                  onChange={(e) => {
                    const newRanges = [...ranges];
                    newRanges[index][1] = parseInt(e.target.value, 10);
                    setRanges(newRanges);
                  }}
                  className={
                    `w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 
                  transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow cursor-pointer appearance-none`}
                >
                    {[...Array(100 - range[0])].map((_, i) => (
                      <option key={i} value={i + range[0] + 1}>{i + range[0] + 1}</option>
                    ))}
                  </select>

                  <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.2"
                  stroke="currentColor"
                  className="h-5 w-5 ml-1 absolute top-2.5 right-2.5 text-slate-700"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75L15.75 15m-7.5-6L12 5.25L15.75 9" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        ))}
      </div>
      )}

      <div className="w-full min-h-[200px] md:min-h-[160px] lg:min-h-[200px] border px-2 py-2 rounded-md">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </>
  );
}
