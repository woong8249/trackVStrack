import { WeeklyChartScope } from '@typings/track';

export function isWithinDateRange(scope: WeeklyChartScope, startDate:Date, endDate:Date) {
  const scopeStartDate = new Date(scope.startDate);
  const scopeEndDate = new Date(scope.endDate);
  return scopeStartDate >= startDate && scopeEndDate <= endDate;
}

export function countRange(filteredChartWeeks: (WeeklyChartScope & { rank: string })[], minRank: number, maxRank: number) {
  return (
    filteredChartWeeks.filter((scope) => {
      const rank = parseInt(scope.rank, 10);
      return rank >= minRank && rank <= maxRank;
    }).length
  );
}
