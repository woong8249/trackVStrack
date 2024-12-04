/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Platform } from '@typings/track';
import PlatformAnalysisBarChart from '@components/PlatformAnalysisBarChart';
import { useState } from 'react';
import { useModal } from '@hooks/useModal';
import { FaChevronDown } from 'react-icons/fa';
import platform, { PlatformName } from '@constants/platform';
import { HelpModal } from '@components/HelpModal';

interface Prob {
  platforms: {
    melon?: Platform;
    genie?: Platform;
    bugs?: Platform;
  };
  startDate:Date
  endDate:Date
}

const platformNames = Object.keys(platform) as PlatformName[];

export default function PlatformAnalysisBox({ platforms, startDate, endDate }: Prob) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const availablePlatformNames = platformNames.filter((key) => platforms[key]) as PlatformName[];

  const availablePlatformName = platformNames.find(
    (key) => platforms[key],
  ) as PlatformName;

  const [platformName, setPlatformName] = useState(availablePlatformName);

  const platformProps = {
    [platformName]: platforms[platformName], platformName, startDate, endDate,
  } as {
    platformName:PlatformName
    melon?:Platform
    genie?:Platform
    bugs?:Platform
    startDate:Date
    endDate:Date
  };

  return (
    <div className="relative bg-white p-8 rounded-lg">

      <div className="flex items-center mb-8">
        <div className="text-base px-2">📊 플랫폼 차트 성과</div>

        <HelpModal>
          <h2 id="chart-performance-title" className="mb-4 text-lg font-semibold text-gray-700">
            📊 플랫폼 차트 성과
          </h2>

          <section id="chart-performance-description" className="text-gray-500 space-y-2">
            <p>
              플랫폼별 주간 차트에서
              {' '}
              <strong className="text-gray-800">차트인 기간</strong>
              과
              {' '}
              <strong className="text-gray-800">순위권 진입 횟수</strong>
              를 확인해보세요.
            </p>

            <p>
              <strong className="text-gray-800">타이틀 옆 달력 버튼</strong>
              을 사용해 특정 기간을 필터링할 수 있습니다.
            </p>

            <p>
              <strong className="text-gray-800">플랫폼 선택 버튼</strong>
              을 통해 특정 플랫폼을 선택할 수 있습니다.
            </p>

            <p>
              <strong className="text-gray-800">범위 설정 버튼</strong>
              으로 원하는 순위 범위를 지정하여 세부적인 데이터를 확인해보세요.
            </p>
          </section>

        </HelpModal>

      </div>

      <div className="absolute top-6 right-6">
        <button onClick={(e) => { e.stopPropagation(); setIsModalOpen((pre) => !pre); }} className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg">
          <img src={platform[platformName].Icon} alt={platformName} className="w-12 h-7" />
          <FaChevronDown size={10} />
        </button>
      </div>

      {isModalOpen && (
      <div
        ref={modalRef}
        className="absolute top-12 right-0 w-[200px] bg-white shadow-lg rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col space-y-2">
          {availablePlatformNames.map((name) => (
            <div
              role="button"
              tabIndex={0}
              key={name}
              onClick={(e) => {
                e.stopPropagation();
                setPlatformName(name);
                setIsModalOpen(false);
              }}
              className="text-sm flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
              <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      <PlatformAnalysisBarChart {...platformProps} />
    </div>
  );
}
