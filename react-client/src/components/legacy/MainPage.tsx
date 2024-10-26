import TrackOverview from '@components/legacy/TrackOverview';
import { useEffect, useRef, useState } from 'react';
import { tracksApi } from '@utils/axios';

import TopNavBar from '@components/legacy/TopNavBar';
import LoadingSpinner from '@components/LoadingSpinner';
import ErrorAlert from '@components/ErrorAlert';
import { TrackWithArtistResponse } from '@typings/track';

// 뷰포트 타입을 '소', '중', '대'로 변경
type ViewportType = 'small' | 'medium' | 'large';

function MainPage() {
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const [error, setError] = useState<Error | null>(null); // 에러 상태 관리
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportType, setViewportType] = useState<ViewportType>('large'); // 뷰포트 타입 상태

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

  // 데이터 요청
  useEffect(() => {
    fetchTracks();
  }, []);

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
        <div className="flex justify-center items-center gap-[2rem] flex-wrap mt-[3rem] pb-[3rem]">
          {tracks.map((track) => (
            <TrackOverview key={track.id} track={track} viewportType={viewportType} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MainPage;
