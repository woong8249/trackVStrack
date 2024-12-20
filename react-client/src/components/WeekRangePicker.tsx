/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
import { Calendar } from 'react-date-range';
import {
  format, startOfWeek, endOfWeek, isWithinInterval, isAfter, isBefore,
} from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useModal } from '@hooks/useModal';
import React, { useEffect, useState } from 'react';

interface WeekRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startWeek: Date, endWeek: Date) => void;
}

export default function WeekRangePicker({ startDate, endDate, onDateRangeChange }: WeekRangePickerProps) {
  const {
    isModalOpen, setIsModalOpen, modalRef,
  } = useModal();

  const [selectedStartWeek, setSelectedStartWeek] = useState<Date | null>(null);
  const [selectedEndWeek, setSelectedEndWeek] = useState<Date | null>(null);

  useEffect(() => {
    setSelectedStartWeek(startDate);
    setSelectedEndWeek(endDate);
  }, [startDate, endDate]);

  // 시작 주 선택 핸들러
  const handleSelectStartWeek = (date: Date) => {
    const startOfSelectedWeek = startOfWeek(date, { weekStartsOn: 1 });
    setSelectedStartWeek(startOfSelectedWeek);
  };

  // 종료 주 선택 핸들러
  const handleSelectEndWeek = (date: Date) => {
    const endOfSelectedWeek = endOfWeek(date, { weekStartsOn: 1 });
    setSelectedEndWeek(endOfSelectedWeek);
  };
    // 적용 버튼 핸들러
  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (selectedStartWeek && selectedEndWeek) {
      onDateRangeChange(selectedStartWeek, selectedEndWeek);
    }
    setIsModalOpen(false);
  };
  const isDateInSelectedStartWeek = (date: Date) => selectedStartWeek
    && isWithinInterval(date, {
      start: startOfWeek(selectedStartWeek, { weekStartsOn: 1 }),
      end: endOfWeek(selectedStartWeek, { weekStartsOn: 1 }),
    });

  const isDateInSelectedEndWeek = (date: Date) => selectedEndWeek
    && isWithinInterval(date, {
      start: startOfWeek(selectedEndWeek, { weekStartsOn: 1 }),
      end: endOfWeek(selectedEndWeek, { weekStartsOn: 1 }),
    });

  const isDateDisabled = (date: Date) => isBefore(date, startDate) || isAfter(date, endDate);

  const modalContent = (
    <div
      className="fixed inset-0 z-[10] flex items-center justify-center bg-black bg-opacity-50"
      >
      <div className="bg-white p-4 rounded shadow-lg relative overflow-x-auto " ref={modalRef}>
        <div>
          <div className="flex gap-10 sm:gap-0  overflow-x-auto w-full">
            {/* 시작 주 달력 */}
            <div className="text-center w-[300px] sm:w-[350px] lg:w-[400px]" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-gray-600 font-bold responsive-text">시작 주</h3>

              <Calendar
                date={selectedStartWeek || new Date()}
                onChange={handleSelectStartWeek}
                minDate={startDate}
                maxDate={endDate}
                className="border border-gray-200 h-[330px]" // 반응형 크기 설정
                dayContentRenderer={(date) => (
                  <div
                  className={`px-2 py-1 text-center rounded-full ${
                    isDateInSelectedStartWeek(date)
                      ? 'bg-blue-500 text-white'
                      : isDateDisabled(date)
                        ? 'text-gray-400'
                        : ''
                  }`}
                >
                    {format(date, 'd')}
                  </div>
                )}
              disabledDay={isDateDisabled}
            />
            </div>

            {/* 종료 주 달력 */}
            <div className="text-center w-[300px] sm:w-[350px] lg:w-[400px]" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-gray-600 font-bold responsive-text">끝 주</h3>

              <Calendar
              date={selectedEndWeek || new Date()}
              onChange={handleSelectEndWeek}
              minDate={startDate}
              maxDate={endDate}
              className="border border-gray-200 h-[330px]"
              dayContentRenderer={(date) => (
                <div
                  className={`px-2 py-1 text-center rounded-full ${
                    isDateInSelectedEndWeek(date)
                      ? 'bg-blue-500 text-white z-10'
                      : isDateDisabled(date)
                        ? 'text-gray-400'
                        : ''
                  }`}
                >
                  {format(date, 'd')}
                </div>
              )}
              disabledDay={isDateDisabled}
            />
            </div>
          </div>
        </div>

        <button
          onClick={handleApply}
          className="responsive-small-text mt-4 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 "
        >
          적용
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative"style={{ display: 'inline-block' }}>
      <div
        role="button"
        tabIndex={0}
        className="py-2 px-1 flex items-center cursor-pointer gap-3 hover:underline"
        onClick={(e) => { setIsModalOpen(!isModalOpen); e.stopPropagation(); }}
      >
        <span>📅</span>

        <span className="text-gray-600 responsive-small-text">
          {`${format(startDate, 'yyyy/MM/dd')} - ${format(endDate, 'yyyy/MM/dd')}`}
        </span>
      </div>

      {isModalOpen && modalContent}
    </div>
  );
}
