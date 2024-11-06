/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Platform } from '@typings/track';
import PlatformAnalysisBarChart from '@components/PlatformAnalysisBarChart';
import { useState } from 'react';
import { useModal } from '@hooks/useModal';
import { FaChevronDown } from 'react-icons/fa';
import { RxQuestionMarkCircled } from 'react-icons/rx';
import platform, { PlatformName } from '@constants/platform';

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

  const {
    isModalOpen: questionIsModalOpen,
    setIsModalOpen: questionSetIsModalOpen,
    modalRef: questionModalRef,
  } = useModal();

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

        <button onClick ={(e) => { e.stopPropagation(); questionSetIsModalOpen((pre) => !pre); }}>
          <RxQuestionMarkCircled size={20} />
        </button>

        { questionIsModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
          <div ref={questionModalRef} className="px-4 py-4 flex flex-col justify-start items-start bg-white rounded-lg max-w-md">
            <div className='mb-4 text-lg text-gray-600'>📊 플랫폼 차트 성과</div>

            <p className="mb-2 text-gray-400">
              플랫폼별 주간 차트에서 차트인 기간과 순위권 진입 횟수를 확인해보세요.
            </p>

            <p className="text-gray-400">
              타이틀 옆 달력 버튼을 통해 특정 기간을 필터할 수 있습니다.
            </p>

            <p className="text-gray-400">
              우측 상단의 "범위 설정" 버튼을 통해 원하는 순위 범위를 지정하여 확인이 가능합니다.
            </p>
          </div>
        </div>

        )}
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
