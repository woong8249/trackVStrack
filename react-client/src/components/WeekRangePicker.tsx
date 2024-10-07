/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { Calendar } from 'react-date-range';
import {
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isAfter,
  isBefore,
} from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useModal } from '@hooks/useModal';

interface WeekRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startWeek: Date, endWeek: Date) => void;
}

export default function WeekRangePicker({ startDate, endDate, onDateRangeChange }: WeekRangePickerProps) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const [selectedStartWeek, setSelectedStartWeek] = useState<Date | null>(startDate);
  const [selectedEndWeek, setSelectedEndWeek] = useState<Date | null>(endDate);

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
  const handleApply = () => {
    if (selectedStartWeek && selectedEndWeek) {
      onDateRangeChange(selectedStartWeek, selectedEndWeek);
    }
    setIsModalOpen(false);
  };

  // 선택된 시작 주의 날짜 여부 확인
  const isDateInSelectedStartWeek = (date: Date) => selectedStartWeek
    && isWithinInterval(date, {
      start: startOfWeek(selectedStartWeek, { weekStartsOn: 1 }),
      end: endOfWeek(selectedStartWeek, { weekStartsOn: 1 }),
    });

  // 선택된 종료 주의 날짜 여부 확인
  const isDateInSelectedEndWeek = (date: Date) => selectedEndWeek
    && isWithinInterval(date, {
      start: startOfWeek(selectedEndWeek, { weekStartsOn: 1 }),
      end: endOfWeek(selectedEndWeek, { weekStartsOn: 1 }),
    });

  // 비활성화된 날짜 확인
  const isDateDisabled = (date: Date) => isBefore(date, startDate) || isAfter(date, endDate);

  return (
    <div className="relative">
      {/* 캘린더 버튼 */}
      <div
        role="button"
        tabIndex={0}
        className="border p-2 flex items-center cursor-pointer gap-3 hover:underline"
        onClick={(e) => { setIsModalOpen(!isModalOpen); e.stopPropagation(); }}
      >
        <span>📅</span>

        <span className="text-gray-600 responsive-small-text">
          {`${format(startDate, 'yyyy/MM/dd')} - ${format(endDate, 'yyyy/MM/dd')}`}
        </span>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="bg-white p-4 rounded shadow-lg relative"
           ref={modalRef}
            >
            <div className="flex space-x-4">
              {/* 시작 주 달력 */}
              <div onClick={(e) => e.stopPropagation()} >
                <h3 className="font-bold responsive-text mb-2">Start Week</h3>

                <Calendar
                  date={selectedStartWeek || new Date()}
                  onChange={handleSelectStartWeek}
                  minDate={startDate}
                  maxDate={endDate}
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
              <div onClick={(e) => e.stopPropagation()} >
                <h3 className="font-bold responsive-text mb-2">End Week</h3>

                <Calendar
                  date={selectedEndWeek || new Date()}
                  onChange={handleSelectEndWeek}
                  minDate={startDate}
                  maxDate={endDate}
                  dayContentRenderer={(date) => (
                    <div
                      className={`px-2 py-1 text-center rounded-full ${
                        isDateInSelectedEndWeek(date)
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
            </div>

            {/* 적용 버튼 */}
            <button
              onClick={handleApply}
              className="mt-4 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
