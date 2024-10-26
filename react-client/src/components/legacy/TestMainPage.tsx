/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useRef, useState } from 'react';
import { tracksApi } from '@utils/axios';

import TopNavBar from '@components/legacy/TopNavBar';
import LoadingSpinner from '@components/LoadingSpinner';
import ErrorAlert from '@components/ErrorAlert';
import TrackInfoCard from '@components/TrackInfoCard';
import ChartGraph from '@components/ChartGraph';
import { useModal } from '@hooks/useModal';
import { FaExpandAlt } from 'react-icons/fa';
import { TrackWithArtistResponse } from '@typings/track';

// 뷰포트 타입을 '소', '중', '대'로 변경
type ViewportType = 'small' | 'medium' | 'large';

function TestMainPage() {
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportType, setViewportType] = useState<ViewportType>('large'); // 뷰포트 타입 상태
  const { isModalOpen, setIsModalOpen, modalRef } = useModal();
  const width = viewportType !== 'small' ? 600 : 400;
  const height = (width >= 600) && viewportType !== 'small' ? 130 + (width / 1.6) : 100;
  const zIndex = isModalOpen ? 10 : 1;

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tracksApi.getTracks({
        minWeeksOnChart: 30,
        withArtists: true,
        sort: 'random',
      }) as TrackWithArtistResponse[];
      setTracks(response);
    } catch (err) {
      setError(err as unknown as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width } = entry.contentRect;

      // width에 따른 '소', '중', '대' 크기 설정
      if (width < 768) {
        setViewportType('small'); // 768px 미만은 소형 뷰포트
      } else if (width >= 768 && width < 1024) {
        setViewportType('medium'); // 768px 이상, 1024px 미만은 중형 뷰포트
      } else {
        setViewportType('large'); // 1024px 이상은 대형 뷰포트
      }
    });

    resizeObserver.observe(container);

    // eslint-disable-next-line consistent-return
    return () => {
      resizeObserver.unobserve(container);
    };
  }, [containerRef]);

  return (
    <div className="min-h-screen min-w-[375px]" ref={containerRef}>
      <TopNavBar />

      <h1 className="p-[1rem] text-center responsive-h1 font-bold mt-[10rem] mb-[1rem] text-shadow">
        "Easily View and Compare Track Charts."
      </h1>

      <span className="flex justify-center items-center font-[400] text-center responsive-text mt-[3rem] text-[#9A9A9A]">
        "당신의 최애곡의 차트 퍼포먼스를 간편히 확인하세요.
        <br />
        또 서로 다른 차트와도 비교해 보세요."
      </span>

      {loading && <LoadingSpinner />}
      {error && <ErrorAlert error={error} retryFunc={fetchTracks} />}

      {!loading && !error && (
      <div className="flex justify-center items-center gap-[2rem] flex-wrap mt-[3rem] ">
        {tracks.map((track) => {
          if (viewportType === 'small') {
            return (
              <div
                className="border-[1px] border-gray-300 rounded-m  relative"
                style={{ zIndex }}
                key={track.id}>
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
                  <div className="mt-[3rem] fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-15">
                    <div
                      ref={modalRef}
                      className="bg-white rounded-lg p-4 relative  w-[auto] overflow-auto"
                      onClick={(e) => e.stopPropagation()}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="w-[40rem] sm:w-[60rem] overflow-auto">
                        <TrackInfoCard track={track} />
                        <div className="border-b-[1px] border-gray-300 mb-[1rem]"></div>
                        <ChartGraph track={track} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={track.id.toString()} className='relative bg-[white] w-[600px]'>
              <div className="border-[1px] border-gray-300 rounded-md shadow-2xl relative">
                <TrackInfoCard track={track} />
                <div className="border-b-[1px] border-gray-300 mb-[1rem]"></div>
                <ChartGraph track={track} />
              </div>

              <div className="absolute top-2 right-2">
                <button onClick={handleModalOpen} className="bg-transparent text-green-600 p-2 rounded-full hover:text-green-800">
                  <FaExpandAlt size={20} />
                </button>

                {/* Modal */}
                {isModalOpen && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-15">
                  <div
                    ref={modalRef}
                    className="bg-white z-10 rounded-lg p-4 relative max-h-[auto] w-[auto] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                    role="button"
                    tabIndex={0}
                >
                    <div className="w-[40rem] sm:w-[50rem] h-[25rem] sm:h-[35rem] overflow-auto">
                      <TrackInfoCard track={track} />
                      <div className="border-b-[1px] border-gray-300 mb-[1rem]"></div>
                      <ChartGraph track={track} />
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

export default TestMainPage;
