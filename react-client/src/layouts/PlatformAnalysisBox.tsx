/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Platform } from '@typings/track';
import PlatformAnalysis from '@components/PlatformAnalysis';
import { useState } from 'react';
import { useModal } from '@hooks/useModal';
import { FaChevronDown } from 'react-icons/fa';

interface Prob {
  platforms: {
    melon?: Platform;
    genie?: Platform;
    bugs?: Platform;
  };
}

export type PlatformName = 'melon' | 'genie' | 'bugs';
const platformNames = ['melon', 'genie', 'bugs'] as PlatformName[];

export default function PlatformAnalysisBox({ platforms }: Prob) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const platformIcons = {
    melon: 'logo/logo_melon.png',
    genie: 'logo/logo_genie.png',
    bugs: 'logo/logo_bugs.png',
  };

  const availablePlatformNames = platformNames.filter((key) => platforms[key]) as PlatformName[];

  const availablePlatformName = platformNames.find(
    (key) => platforms[key],
  ) as PlatformName;

  const [platformName, setPlatformName] = useState(availablePlatformName);

  const platformProps = { [platformName]: platforms[platformName], platformName } as {
    platformName:PlatformName
      melon?:Platform
      genie?:Platform
      bugs?:Platform
  };

  return (
    <div className="relative bg-white p-8 rounded-lg">
      <div className='px-2 mb-8'>플랫폼 차트 성과</div>

      <div className="absolute top-4 right-4">
        <button onClick={(e) => { e.stopPropagation(); setIsModalOpen((pre) => !pre); }} className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg">
          <img src={platformIcons[platformName]} alt={platformName} className="w-12 h-7" />
          <FaChevronDown size={10} />
        </button>
      </div>

      <PlatformAnalysis {...platformProps} />

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

    </div>
  );
}
