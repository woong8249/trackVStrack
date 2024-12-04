import {
  useEffect, useRef, MutableRefObject,
} from 'react';
import { Chart as ChartJS } from 'chart.js';

interface UseResponsiveChartReturn {
  chartRef: MutableRefObject<ChartJS<'line', { x: string; y: number | null }[], unknown> | null>;
}

export function useResponsiveChart(): UseResponsiveChartReturn {
  const chartRef = useRef<ChartJS<'line', { x: string; y: number | null }[], unknown> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current) {
        setTimeout(() => {
          (chartRef.current as ChartJS<'line', { x: string; y: number | null }[], unknown>).resize(); // Chart.js 강제 업데이트
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
