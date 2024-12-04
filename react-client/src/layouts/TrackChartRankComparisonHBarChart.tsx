import { HelpModal } from '@components/HelpModal';
import TrackInfoCard from '@components/TrackInfoCard';
import { PlatformName } from '@constants/platform';
import { SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import { ChartOptions, TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';

interface Prob {
  tracks: Omit<SelectedTrack & { track: TrackWithArtistResponse }, 'activate'>[];
  selectedPlatformName: PlatformName;
  startDate: Date;
  endDate: Date;
}

export function TrackChartRankComparisonHBarChart({
  tracks, selectedPlatformName, startDate, endDate,
}: Prob) {
  // 1. 점수 계산 (선택한 기간만 고려)
  const calculatePlatformScore = (track: TrackWithArtistResponse, platformName: PlatformName) => {
    const platform = track.platforms[platformName];
    if (!platform) return 0;

    return platform.weeklyChartScope.reduce((acc, scope) => {
      const scopeStartDate = new Date(scope.startDate);
      const scopeEndDate = new Date(scope.endDate);

      // 주어진 기간 내의 점수만 계산
      if (scopeStartDate >= startDate && scopeEndDate <= endDate) {
        return acc + (101 - Number(scope.rank));
      }
      return acc;
    }, 0);
  };

  // 2. 점수 계산 후 내림차순 정렬
  const rankedTracks = tracks
    .map((selectedTrack) => ({
      ...selectedTrack,
      score: calculatePlatformScore(selectedTrack.track, selectedPlatformName),
    }))
    .sort((a, b) => b.score - a.score);

  // 3. 차트 데이터 생성
  const chartData = {
    labels: rankedTracks.map((track) => track.track.titleName),
    datasets: [
      {
        label: '플랫폼 성적 (점수)',
        data: rankedTracks.map((track) => track.score),
        backgroundColor: rankedTracks.map((track) => track.color),
        barThickness: 20, // 막대 두께
      },
    ],
  };

  // 4. 차트 옵션
  const chartOptions :ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // 수평 막대
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: TooltipItem<'bar'>) => {
            // raw 값을 number로 변환
            const value = tooltipItem.raw as number | undefined;
            return value !== undefined ? `점수: ${value}` : '데이터 없음';
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Score',
          font: { size: 12, weight: 'lighter' },
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Track Name',
          font: { size: 12, weight: 'lighter' },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const chartHeight = tracks.length * 60 + 50;

  return (
    <div className="py-8">
      {/* 헤더 */}
      <div className="flex mb-6 px-8 pb-2">
        <div className="flex items-center px-2 gap-2">
          <div> 🥇 트랙 차트 퍼포먼스 비교</div>

          <HelpModal>
            <h2 id="chart-comparison-title" className="mb-4 text-lg font-semibold text-gray-700">
              🥇 트랙 차트 퍼포먼스 비교
            </h2>

            <section id="chart-comparison-description" className="text-gray-500 space-y-3">
              <p>
                선택한 기간 동안 각 트랙의 플랫폼 점수를 비교합니다.
              </p>

              <p>
                <strong className="text-gray-800">점수 계산 방식:</strong>
                <br />
                - 각 주의 순위를
                {' '}
                <strong>100에서 해당 순위를 뺀 값</strong>
                으로 점수를 계산합니다.
                <br />
                - 예를 들어, 1위는 100점, 2위는 99점, 100위는 1점을 얻습니다.
                <br />
                - 주간 점수를 합산하여 플랫폼 점수가 산출됩니다.
              </p>

            </section>
          </HelpModal>

        </div>
      </div>

      {/* 본문 */}
      <div className="flex flex-col lg:flex-row gap-8 p-8 px-8 sm:px-14 lg:divide-x lg:divide-gray-100">
        {/* Contents 1: 순위와 TrackInfoCards */}
        <div className="w-full lg:pr-8">
          {rankedTracks.map((track, index) => (
            <div key={track.track.id}>
              <div className="flex items-center gap-4">
                {/* 순위 */}
                <span className="font-semibold text-xl">{index + 1}</span>

                {/* 색상 점 */}
                <div
                  style={{ backgroundColor: track.color }}
                  className="w-2 h-2 rounded-full"
                />

                {/* TrackInfoCard */}
                <TrackInfoCard track={track.track} size={60} />
              </div>

              <hr className="font mb-2" />
            </div>
          ))}
        </div>

        {/* Contents 2: Horizontal Bar Chart */}
        <div className="w-full lg:pl-8">
          <Bar
            data={chartData}
            options={chartOptions}
            style={{ height: `${chartHeight}px` }}
          />
        </div>
      </div>

    </div>
  );
}
