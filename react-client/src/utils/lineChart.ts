/* eslint-disable no-underscore-dangle */
import { PlatformName } from '@constants/platform';
import { Platform, TrackResponse, TrackWithArtistResponse } from '@typings/track';
import { Chart, TooltipModel } from 'chart.js';

export type Dataset ={
  label: string;
  data: { x: string; y: number }[];
  borderColor: string
  backgroundColor: string;
  yAxisID?: string
 }

export function pickLabelRangeFromMultiplePlatform(
  track:TrackResponse,
  startDate:Date,
  endDate:Date,
) {
  return Array.from(
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
}

export function pickLabelRangeLabelMultipleTrack(
  tracks: TrackResponse[],
  platformName: PlatformName, // 특정 플랫폼만
  startDate: Date,
  endDate: Date,
) {
  return Array.from(
    new Set(
      tracks.flatMap((track) => track.platforms[platformName]?.weeklyChartScope
        .filter((scope) => {
          const { startDate: _startDate, endDate: _endDate } = scope;
          return new Date(_startDate) >= startDate && new Date(_endDate) <= endDate;
        })
        .map(
          (info) => `${info.weekOfMonth.year}-${info.weekOfMonth.month}-${info.weekOfMonth.week}`,
        ) || []),
    ),
  ).sort((a, b) => {
    const [aYear, aMonth, aWeek] = a.split('-').map(Number);
    const [bYear, bMonth, bWeek] = b.split('-').map(Number);

    if (aYear !== bYear) return aYear - bYear;
    if (aMonth !== bMonth) return aMonth - bMonth;
    return aWeek - bWeek;
  });
}

export function pickXAxis(
  platform:Platform | undefined,
  startDate:Date,
  endDate:Date,
) {
  if (!platform) return [];
  return Array.from(
    new Set(
      platform.weeklyChartScope.filter((scope) => {
        const { startDate: _startDate, endDate: _endDate } = scope;
        return new Date(_startDate) >= startDate && new Date(_endDate) <= endDate;
      }).map((info) => `${info.weekOfMonth.year}-${info.weekOfMonth.month}-${info.weekOfMonth.week}`),
    ),
  ).sort((a, b) => {
    const [aYear, aMonth, aWeek] = a.split('-').map(Number);
    const [bYear, bMonth, bWeek] = b.split('-').map(Number);

    if (aYear !== bYear) return aYear - bYear;
    if (aMonth !== bMonth) return aMonth - bMonth;
    return aWeek - bWeek;
  });
}

export function pickYAxis(
  platform: Platform | undefined,
  startDate: Date,
  endDate: Date,
) {
  if (!platform) return [];
  return platform.weeklyChartScope
    .filter((scope) => {
      const { startDate: _startDate, endDate: _endDate } = scope;
      return new Date(_startDate) >= startDate && new Date(_endDate) <= endDate;
    })
    .map((info) => parseInt(info.rank, 10)); // 랭킹 정보만 추출
}

export function sortTracksByStartDate(
  tracks: TrackResponse[]|TrackWithArtistResponse[],
  platformName: PlatformName,
  startDate: Date,
  endDate: Date,
): TrackResponse[] {
  return tracks.slice().sort((a, b) => {
    const aStartDate = new Date(pickXAxis(a.platforms[platformName], startDate, endDate)[0]);
    const bStartDate = new Date(pickXAxis(b.platforms[platformName], startDate, endDate)[0]);
    return aStartDate.getTime() - bStartDate.getTime();
  });
}

export const verticalLinePlugin = {
  id: 'verticalLine',
  afterDraw: (chart: Chart<'line'>) => {
    const activeTooltip = chart.tooltip as TooltipModel<'line'> & { _active: { element: { x: number } }[] };
    if (activeTooltip._active && activeTooltip._active.length) {
      const { ctx } = chart;
      const activePoint = activeTooltip._active[0];
      const { x } = activePoint.element;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // 원하는 색상 및 투명도 설정
      ctx.stroke();
      ctx.restore();
    }
  },
};
