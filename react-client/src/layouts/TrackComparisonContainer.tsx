/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';

import 'chart.js/auto';
import { useModal } from '@hooks/useModal';
import { FaChevronDown } from 'react-icons/fa';
import platform, { PlatformName } from '@constants/platform';

import 'chart.js/auto';
import { SelectedTrack } from '@sections/ExploreSection2';
import { TrackComparisonBoxWithLineChartWrapper } from './TrackComparisonBoxWithLineChartWrapper';

export interface Prob {
  selectedTracks:SelectedTrack[]
}

export function TrackComparisonContainer({ selectedTracks }:Prob) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const platformNames = Object.keys(platform) as PlatformName[];
  const [selectedPlatformName, setSelectedPlatformName] = useState<PlatformName>(platformNames[0]);
  // 임의코드
  const startDate = new Date('2021-01-01');
  const endDate = new Date();

  return (
    <div className='w-full'>
      {/* header */}
      <div className='flex items-center relative p-2 mb-4'>
        {/* 헤더자식1- 헤더 h1  */}
        <h1 className='text-xl'>Track VS Track</h1>

        {/* 헤더자식2- 플랫폼선택모달 */}
        <div className="absolute right-3 ">
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

      </div>

      {/* contents */}
      <div className="w-full flex flex-col gap-2 items-center md:flex-row  md:items-stretch md:justify-center">
        {/*  content1  */}
        <div className='bg-white p-2 rounded-md w-[100%] md:w-[70%]'>
          <TrackComparisonBoxWithLineChartWrapper
            selectedTracks={selectedTracks}
            selectedPlatformName={selectedPlatformName}
            startDate={startDate}
            endDate={endDate} />

        </div>

        {/*  content2  */}
        <div className="bg-white p-2 rounded-md w-[100%]  md:w-[30%] ">
          11
        </div>

      </div>
    </div>
  );
}
