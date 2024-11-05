/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';

import 'chart.js/auto';
import { useModal } from '@hooks/useModal';
import { FaChevronDown } from 'react-icons/fa';
import platform, { PlatformName } from '@constants/platform';
import sampleTracks from '@constants/sample.json';
import { TrackWithArtistResponse } from '@typings/track';
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
} from 'chart.js';
import 'chart.js/auto';
import {
  lineChartOption,
  pickLabelRangeLabelMultipleTrack, pickXAxis, pickYAxis,
  verticalLinePlugin,
} from '@utils/lineChart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SelectedTrack {
  id: number;
  activate: boolean;
  track: TrackWithArtistResponse;
  color: string;
}

export function TrackComparisonContainer() {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const platformNames = Object.keys(platform) as PlatformName[];
  const [selectedPlatformName, setSelectedPlatformName] = useState<PlatformName>(platformNames[0]);
  // 전달받는 코드로 수정되어야함
  const selectedTracks = sampleTracks as SelectedTrack[];
  const startDate = new Date('2021-01-01');
  const endDate = new Date();

  // 1. 공통된 라벨 생성
  const commonLabels = pickLabelRangeLabelMultipleTrack(
    selectedTracks.map((selectedTrack) => selectedTrack.track),
    selectedPlatformName,
    startDate,
    endDate,
  );

  const chartData = {
    labels: commonLabels,
    datasets: selectedTracks.map((selectedTrack) => {
      const { color, track } = selectedTrack;
      const { platforms } = track;

      if (platforms[selectedPlatformName]) {
        const platform = platforms[selectedPlatformName];
        const xAxis = pickXAxis(platform, startDate, endDate);
        const yAxis = pickYAxis(platform, startDate, endDate);

        // tooltip mode index에서 길이 와 순서를 맞추기위함
        // 2. 공통 라벨과 일치하도록 데이터 정렬 및 빈 값 채우기
        const data = commonLabels.map((label) => {
          const index = xAxis.indexOf(label);
          return index !== -1 ? { x: label, y: yAxis[index] } : { x: label, y: null };
        });

        return {
          label: track.titleName,
          data,
          borderColor: color,
          backgroundColor: color,
          // yAxisID: selectedPlatformName,
        };
      }
      return null; // 선택된 플랫폼이 없는 경우 null을 반환
    }).filter((dataset) => dataset !== null),
  };

  return (
    <div className='relative w-full h-full'>
      <div className="absolute  right-6 border">
        <button
          onClick={(e) => { e.stopPropagation(); setIsModalOpen((pre) => !pre); }}
          className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg">
          <img
            src={platform[selectedPlatformName].Icon}
            alt={selectedPlatformName}
            className="w-12 h-7" />

          <FaChevronDown size={10} />
        </button>
      </div>

      {isModalOpen && (
      <div
        ref={modalRef}
        className="absolute top-12 right-0 w-[200px] bg-white shadow-lg rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col space-y-2">
          {platformNames.map((name) => (
            <div
              role="button"
              tabIndex={0}
              key={name}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPlatformName(name);
                setIsModalOpen(false);
              }}
              className="text-sm flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      <Line
        data={chartData}
        options={lineChartOption}
        plugins={[verticalLinePlugin]}
      />
    </div>
  );
}
