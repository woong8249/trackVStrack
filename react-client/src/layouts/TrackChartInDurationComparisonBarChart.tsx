import { HelpModal } from '@components/HelpModal';
import { PlatformName } from '@constants/platform';
import { useModal } from '@hooks/useModal';
import { SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import { pickYAxis } from '@utils/lineChart';
import { ChartOptions, TooltipItem } from 'chart.js';
import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Range, getTrackBackground } from 'react-range';

function isTrackWithArtistResponse(track: SelectedTrack): track is SelectedTrack & { track: TrackWithArtistResponse } {
  return (track.track as TrackWithArtistResponse).titleName !== undefined;
}

interface Prob {
  tracks: SelectedTrack[];
  selectedPlatformName: PlatformName;
  startDate: Date;
  endDate: Date;
}

export function TrackChartInDurationComparisonBarChart({
  tracks, selectedPlatformName, startDate, endDate,
}: Prob) {
  const [appliedRange, setAppliedRange] = useState<[number, number]>([1, 100]);
  const [tempRange, setTempRange] = useState<[number, number]>([1, 100]);
  const {
    isModalOpen,
    setIsModalOpen,
    modalRef,
  } = useModal();
  const [minRank, maxRank] = appliedRange;
  const filteredTracks = tracks.filter(isTrackWithArtistResponse);
  const labels = filteredTracks.map((track) => track.track.titleName);

  const barChartData = {
    labels,
    datasets: [
      {
        data: filteredTracks.map((track) => {
          const platform = track.track.platforms[selectedPlatformName];
          const yAxis = pickYAxis(platform, startDate, endDate);
          // 선택된 범위 내 유지 기간 계산
          return yAxis.filter((rank) => rank !== null && rank >= minRank && rank <= maxRank).length;
        }),
        backgroundColor: filteredTracks.map((track) => track.color),
      },
    ],
  };
  const data = {
    ...barChartData,
    datasets: barChartData.datasets.map((dataset) => ({
      ...dataset,
      barThickness: 30, // 막대 두께 고정
      backgroundColor: dataset.backgroundColor,
    })),
  };

  const option: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, // 레이블 표시 활성화
        position: 'bottom' as const,
        labels: {
          generateLabels: (chart) => {
            const datasets = chart.data.datasets[0];
            const labels = chart.data.labels || [];
            return labels.map((label, index) => ({
              text: `${label}`, // 트랙의 titleName
              fillStyle: (datasets.backgroundColor as string[])[index], // 트랙의 color
              hidden: false, // 항상 표시
            }));
          },
          boxWidth: 20, // 레이블 박스 크기 설정
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label(context: TooltipItem<'bar'>) {
            const value = context.raw || 0; // 해당 데이터의 값
            return `차트에 ${value}주 동안 머물렀습니다.`; // 커스텀 텍스트 반환
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tracks', // x축 제목 텍스트
          font: { size: 12, weight: 'lighter' },
          padding: 20, // x축 제목과 차트 사이 간격 (픽셀 단위)
        },
        ticks: {
          display: false, // x축 라벨 숨기기
        },
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Chart-In Period (Weeks)',
          font: { size: 12, weight: 'lighter' },
        },
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className='bg-white'>
      <div className='flex px-8 mb-6 gap-1 items-center'>
        <div >
          📊 트랙 간 차트인 기간 비교
        </div>

        <HelpModal >
          <h2 id="chart-comparison-title" className="mb-4 text-lg font-semibold text-gray-700">
            📊 트랙 간 차트인 기간 비교
          </h2>

          <section id="chart-comparison-description" className="text-gray-500 space-y-3">
            <p>
              <strong className="text-gray-800">트랙 간의 차트인 기간</strong>
              을 한눈에 비교하고 분석할 수 있는 차트입니다.
              <strong className="text-gray-800">해당 트랙이 차트에서 얼마나 오래 유지되었는지</strong>
              직관적으로 확인해 보세요.
            </p>

            <p>
              <strong className="text-gray-800">범위 설정</strong>
              {' '}
              버튼을 통해 특정 순위 범위를 필터링할 수 있습니다.
            </p>

            <p>
              <strong className="text-gray-800">좌측 상단</strong>
              {' '}
              달력 버튼을 통해 특정 기간을 필터링할 수 있습니다.
            </p>

            <p>
              <strong className="text-gray-800">우측 상단</strong>
              {' '}
              플랫폼 버튼을 통해 플랫폼을 선택할 수 있습니다.
            </p>
          </section>
        </HelpModal>
      </div>

      <div className="flex px-8 mb-8 items-center gap-2">
        {/* 현재 범위 표시 */}
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
          {appliedRange[0]}
          등 -
          {appliedRange[1]}
          등
        </span>

        {/* 범위 설정 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setTempRange(appliedRange); // 현재 적용된 범위로 초기화
            setIsModalOpen(true);
          }}
        className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300"
        >
          범위 설정
        </button>

        {isModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
          <div ref={modalRef} className="px-10 py-10 flex flex-col bg-white rounded-lg max-w-md shadow-lg items-center">
            <h2 className="mb-6 text-lg font-semibold text-gray-800">순위 범위 설정</h2>

            <div className="flex flex-col items-center">
              <Range
                step={1}
                min={1}
                max={100}
                values={tempRange}
                onChange={(values) => setTempRange(values as [number, number])}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '4px',
                      width: '150%',
                      background: getTrackBackground({
                        values: tempRange,
                        colors: ['#ccc', '#007bff', '#ccc'],
                        min: 1,
                        max: 100,
                      }),
                    }}
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '16px',
                      width: '16px',
                      backgroundColor: '#007bff',
                      borderRadius: '50%',
                    }}
                  />
                )}
              />

              <div className="mt-4">
                <span className='font-thin'>
                  {' '}
                  {tempRange[0]}
                  {'등 '}
                  -
                  {' '}
                  {tempRange[1]}
                  {'등 '}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }} // 변경 취소
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
              >
                취소
              </button>

              <button
                onClick={(e) => {
                  setAppliedRange(tempRange); // 변경 사항 적용
                  e.stopPropagation(); setIsModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                확인
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      <div className="p-2 rounded-md">
        <Bar
          style={{ height: '300px' }}
          data={data}
          options={option} />
      </div>

    </div>
  );
}
