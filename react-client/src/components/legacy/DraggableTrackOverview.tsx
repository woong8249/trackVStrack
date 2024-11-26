/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  SyntheticEvent, useEffect, useRef, useState,
} from 'react';
import { Resizable, ResizeCallbackData } from 'react-resizable';
import { useModal } from '@hooks/useModal';
import PlatformCompareLineChart from '../PlatformCompareLineChart';
import TrackInfoCard from '../TrackInfoCard';

import 'react-resizable/css/styles.css';
import { FaExpandAlt } from 'react-icons/fa';
import { TrackWithArtistResponse } from '@typings/track';

interface Props {
  track: TrackWithArtistResponse;
  viewportType: 'small' | 'medium' | 'large';
}

export default function TrackOverview({ track, viewportType }: Props) {
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const [width, setWidth] = useState(viewportType !== 'small' ? 600 : 400); // width를 상태로 관리
  const height = (width >= 600) && viewportType !== 'small' ? 130 + (width / 1.6) : 100;
  const isLargeContainer = width >= 600;
  const [isResizing, setIsResizing] = useState(false);
  const initialWidth = useRef(width);
  const initialHeight = useRef(height);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [focused, setFocused] = useState(false); // 포커스 상태 관리
  const zIndex = (isResizing || focused || isModalOpen) ? 10 : 1; // 포커스 시 z-index 증가
  const position: 'relative' | 'absolute' = isResizing ? 'absolute' : 'relative';

  const startDate = new Date('2000-01-01');
  const endDate = new Date();

  useEffect(() => {
    const handleFocusIn = () => setFocused(true);
    const handleFocusOut = () => setFocused(false);

    const container = containerRef.current;
    if (container) {
      container.addEventListener('focusin', handleFocusIn); // 포커스 감지
      container.addEventListener('focusout', handleFocusOut); // 포커스 떠날 때
    }

    return () => {
      if (container) {
        container.removeEventListener('focusin', handleFocusIn);
        container.removeEventListener('focusout', handleFocusOut);
      }
    };
  }, [containerRef]);

  const handleResizeStart = () => {
    initialWidth.current = width; // 리사이즈 시작 시 width 고정
    initialHeight.current = height; // 리사이즈 시작 시 height 고정
    setIsResizing(true); // 리사이즈 중임을 상태로 관리
  };

  const onResize = (_e: SyntheticEvent, { size }: ResizeCallbackData) => {
    const newWidth = size.width;
    setWidth(newWidth); // width만 상태로 관리
  };

  const handleResizeStop = () => {
    setIsResizing(false);
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  return (
    viewportType === 'small' ? (
      <div
      className="border-[1px] border-gray-300 rounded-m transition shadow-2xl relative"
      style={{ zIndex }}>
        <div
          style={{ width, height }}>
          <TrackInfoCard track={track} />
        </div>

        <div className="absolute top-2 right-2">
          <button onClick={handleModalOpen} className="bg-transparent text-green-600 p-2 rounded-full hover:text-green-800">
            <FaExpandAlt size={20} />
          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-15 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto"
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <div className="w-[50rem] sm:w-[70rem] overflow-auto">
              <TrackInfoCard track={track} />
              <div className="border-b-[1px] border-gray-300 mb-[1rem]"></div>
              <PlatformCompareLineChart track={track} startDate={startDate} endDate={endDate} />
            </div>
          </div>
        </div>
        )}
      </div>
    )
      : (
        <div style={{ position: 'relative' }} ref={containerRef}>
          {isResizing && (
          <div
            style={{
              width: `${initialWidth.current}px`, // 리사이즈 시작 시의 고정된 width
              height: `${initialHeight.current}px`, // 리사이즈 시작 시의 고정된 height
              display: 'inline-block', // 원래 자리 차지
              visibility: 'hidden', // 공간을 차지하되 보이지 않도록 설정
            }}
          />
          )}

          <div
            className="border-[1px] border-gray-300 rounded-m  shadow-2xl"
            style={{
              position, // 리사이징 중일 때는 absolute로 설정
              zIndex, // 리사이징 중일 때 더 높은 레이어에 위치
              top: position === 'absolute' ? '0' : undefined,
              left: position === 'absolute' ? '0' : undefined,
              width: `${width}px`,
              height: `${height}px`,
              // transition: 'all 0.1s ease', // 애니메이션 속도 설정
            }}
          >
            <Resizable
              width={width}
              height={height}
              onResize={onResize}
              onResizeStart={handleResizeStart} // 리사이즈 시작
              onResizeStop={handleResizeStop} // 리사이즈 끝
              minConstraints={[400, 100]}
              maxConstraints={[800, 500]}
              lockAspectRatio={false}
            >
              <div
                style={{
                  width: '100%', height: '100%',
                }}>
                <TrackInfoCard track={track} />

                { isLargeContainer && (
                <>
                  <div className="border-b-[1px] border-gray-300 mb-[1rem]"></div>
                  <PlatformCompareLineChart track={track} startDate={startDate} endDate={endDate} />
                </>
                )}
              </div>
            </Resizable>

            <div className="absolute top-2 right-2">
              <button onClick={handleModalOpen} className="bg-transparent text-green-600 p-2 rounded-full hover:text-green-800">
                <FaExpandAlt size={20} />
              </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
            <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-15 backdrop-blur-sm">
              <div
                ref={modalRef}
                className="bg-white z-999 rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto"
                onClick={(e) => e.stopPropagation()}
                role="button"
                tabIndex={0}
              >
                <div className="w-[50rem] sm:w-[70rem] overflow-auto">
                  <TrackInfoCard track={track} />
                  <div className="border-b-[1px] border-gray-300 mb-[1rem]"></div>
                  <PlatformCompareLineChart track={track} startDate={startDate} endDate={endDate} />
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      )
  );
}
