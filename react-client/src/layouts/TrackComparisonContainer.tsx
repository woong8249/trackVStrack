/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useState } from 'react';

import 'chart.js/auto';
import { useModal } from '@hooks/useModal';
import { FaChevronDown } from 'react-icons/fa';
import platform, { PlatformName } from '@constants/platform';

import 'chart.js/auto';
import { TrackComparisonWrapper } from '@layouts/TrackComparisonWrapper';
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
  const { data: cachedTracks, isLoading, error } = useCachedTracks(selectedTracks);
  const [selectedPlatformName, setSelectedPlatformName] = useState<PlatformName>(platformNames[0]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate((prevStartDate) => {
      if (prevStartDate.getTime() !== newStartDate.getTime()) {
        return newStartDate;
      }
      return prevStartDate; // 기존 값 유지
    });

    setEndDate((prevEndDate) => {
      if (prevEndDate.getTime() !== newEndDate.getTime()) {
        return newEndDate;
      }
      return prevEndDate; // 기존 값 유지
    });
  };

  useEffect(() => {
    if (cachedTracks) {
      const availableTracks = cachedTracks
        .filter((track) => track?.titleName) as TrackWithArtistResponse[];

      if (availableTracks.length > 0) {
        const result = mergeTracksDateRange(availableTracks);
        handleDateRangeChange(result.startDate, result.endDate);
      }
    }
  }, [cachedTracks]);

  if (error) {
    return <LoadingSpinner />;
  }
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (cachedTracks && cachedTracks.some((track) => track?.titleName)) {
    const mappedSelectedTracks = selectedTracks.map((item, index) => ({ ...item, track: cachedTracks[index] }));
    return (
      <div className='w-full'>
        {/* header */}
        <div className='flex items-center relative p-2 mb-4 gap-2 w-full'>

          {/* 헤더자식1- h1  */}
          <div className='flex sm:flex-row sm:items-center sm:gap-2  flex-col'>
            <h1 className='text-xl '>Track VS Track</h1>

            <WeekRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange} />
          </div>

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

        {/* contents */}
        <div className='p-2 '>
          <TrackComparisonWrapper
              selectedTracks={mappedSelectedTracks}
              selectedPlatformName={selectedPlatformName}
              startDate={startDate}
              endDate={endDate} />
        </div>

      </div>
    );
  }
}
