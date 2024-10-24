/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */

import { useEffect, useRef, useState } from 'react';
import { useImmer } from 'use-immer';
import { useLocation } from 'react-router-dom';
import TopNavbar from '@components/type2/TopNavBar';
import ExploreSection1 from '@layouts/ExploreSection1';
import { TrackWithArtistResponse } from '@typings/track';
import ExploreSection2 from '@layouts/ExploreSection2';

export enum Color {
  Blue = 'bg-blue-500',
  Red = 'bg-red-500',
  Green = 'bg-green-500',
  Yellow = 'bg-yellow-500',
  Purple = 'bg-purple-500',
  Black = 'bg-black',
}

export interface SelectedTrack {
  id: number;
  activate: boolean;
  track?: TrackWithArtistResponse | null;
  color: Color;
}

export default function ExplorePage() {
  const location = useLocation();
  const trackData: TrackWithArtistResponse | undefined = location.state?.track;
  const colorArray = Object.values(Color);
  const initialSelectTrackBoxes = [{
    id: 0, activate: true, color: colorArray[0], track: trackData,
  }];

  const containerRef = useRef<HTMLInputElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0); // 뷰포트 너비 저장
  const [
    selectedTracks,
    setSelectedTracks,
  ] = useImmer<SelectedTrack[]>(() => {
    // localStorage에서 상태 복원
    const savedTracks = localStorage.getItem('selectedTracks');
    return savedTracks ? JSON.parse(savedTracks) : initialSelectTrackBoxes;
  });

  // 브라우저 리사이즈 감지
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width } = entry.contentRect;
      setContainerWidth(width);
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.unobserve(container);
    };
  }, [containerRef]);

  // selectedTracks가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('selectedTracks', JSON.stringify(selectedTracks));
  }, [selectedTracks]);

  // 페이지 로드 시 초기 상태 복원
  useEffect(() => {
    if (selectedTracks.length === 0) {
      setSelectedTracks(initialSelectTrackBoxes);
    }
  }, [initialSelectTrackBoxes]);

  return (
    <div ref={containerRef} className="bg-[#eaeff8] min-h-screen flex flex-col items-center min-w-[350px]">
      <TopNavbar currentPage="explore" />

      <ExploreSection1
        selectedTracks={selectedTracks}
        setSelectedTracks={setSelectedTracks}
        containerWidth={containerWidth} />

      <ExploreSection2 selectedTracks={selectedTracks} />
    </div>
  );
}
