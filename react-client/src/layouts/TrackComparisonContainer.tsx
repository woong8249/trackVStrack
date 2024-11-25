/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from 'react';

import 'chart.js/auto';
import { useModal } from '@hooks/useModal';
import { FaChevronDown } from 'react-icons/fa';
import platform, { PlatformName } from '@constants/platform';

import 'chart.js/auto';
import { TrackComparisonBoxWithLineChartWrapper } from './TrackComparisonBoxWithLineChartWrapper';
import { SelectedTrack } from '@pages/ExplorePage';
import { useCachedTracks } from '@hooks/useCachedTracks';
import LoadingSpinner from '@components/LoadingSpinner';
import WeekRangePicker from '@components/WeekRangePicker';
import { mergeTracksDateRange } from '@utils/time';
import { TrackWithArtistResponse } from '@typings/track';

export interface Prob {
  selectedTracks:SelectedTrack[]
}

export function TrackComparisonContainer({ selectedTracks }:Prob) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const platformNames = Object.keys(platform) as PlatformName[];
  const { selectedTracks: cachedTracks, isLoading, error } = useCachedTracks(selectedTracks);
  const [selectedPlatformName, setSelectedPlatformName] = useState<PlatformName>(platformNames[0]);
  const [startDate, setStartDate] = useState<Date>(new Date('2012-01-01'));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  useEffect(() => {
    const args = cachedTracks
      .filter((track) => (track.track as TrackWithArtistResponse)?.titleName)
      .map((item) => item.track) as TrackWithArtistResponse[];

    if (args.length > 0) {
      const { startDate: newStartDate, endDate: newEndDate } = mergeTracksDateRange(args);

      // 이전 상태와 비교하여 업데이트
      if (newStartDate.getTime() !== startDate.getTime() || newEndDate.getTime() !== endDate.getTime()) {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
      }
    }
  }, [cachedTracks, startDate, endDate]);

  if (error) {
    return <LoadingSpinner />;
  }
  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (cachedTracks.length > 1) {
    return (
      <div className='w-full'>
        {/* header */}
        <div className='flex items-center relative p-2 mb-4 gap-2'>
          {/* 헤더자식1- h1  */}
          <h1 className='text-xl'>Track VS Track</h1>
          {/* 헤더자식2- 달력  */}
          <WeekRangePicker startDate={startDate} endDate={endDate} onDateRangeChange={handleDateRangeChange} />

          {/* 헤더자식3- 플랫폼선택모달 */}
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

        {/*  content1  */}
        <div className='bg-white p-2 rounded-md w-[100%] '>
          <TrackComparisonBoxWithLineChartWrapper
              selectedTracks={cachedTracks}
              selectedPlatformName={selectedPlatformName}
              startDate={startDate}
              endDate={endDate} />

        </div>

      </div>
    );
  }
}
