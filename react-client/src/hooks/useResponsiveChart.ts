import { MutableRefObject, useRef, useEffect } from 'react';
import { Chart as ChartJS } from 'chart.js';

type ChartRefType =
  | ChartJS<'line'>
  | ChartJS<'line', { x: number; y: number | null }[]>
  | null;

export interface UseResponsiveChartReturn {
  chartRef: MutableRefObject<ChartRefType>;
}

export function useResponsiveChart(): UseResponsiveChartReturn {
  const chartRef = useRef<ChartRefType>(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current?.resize(); // Chart.js 강제 업데이트
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { chartRef };
}
