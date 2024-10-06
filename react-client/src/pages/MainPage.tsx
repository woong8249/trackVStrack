/* eslint-disable consistent-return */
import TrackOverview from '@components/TrackOverview';
import { useEffect, useState, useRef } from 'react';
import { trackWithArtistApi } from '@utils/axios';
import { TrackWithArtistResponse } from '@typings/track-artist';
import TopNavBar from '@layouts/TopNavBar';
import LoadingSpinner from '@components/LoadingSpinner';
import ErrorAlert from '@components/ErrorAlert';

function MainPage() {
  const [isLargeViewport, setIsLargeViewport] = useState(false);
  const [tracks, setTracks] = useState<TrackWithArtistResponse[]>([]);
  const [loading, setLoading] = useState(true); // 로딩 상태 관리
  const [error, setError] = useState<Error | null>(null); // 에러 상태 관리
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await trackWithArtistApi.getTracksWithArtist({
        minWeeksOnChart: 30,
        sort: 'random',
      });
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
      const [_container] = entries;
      if (_container.contentRect.width >= 768) {
        setIsLargeViewport(true);
      } else {
        setIsLargeViewport(false);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, [containerRef]);

  return (
    <div className="min-h-screen min-w-[375px]" ref={containerRef}>
      <TopNavBar />

      <h1 className="text-center responsive-h1 font-bold mt-[10rem] mb-[1rem] text-shadow">
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
            <TrackOverview key={track.id} track={track} isLargeViewport={isLargeViewport} />
          ))}
        </div>
      )}
    </div>
  );
}

export default MainPage;
