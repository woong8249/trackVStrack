/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import SearchTrackBox from '@components/SearchTrackBox';
import { Color, SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import { useEffect, useRef, useState } from 'react';
import { Updater } from 'use-immer';

interface Prob{
    selectedTracks: SelectedTrack[]; // 상태 값
    setSelectedTracks: Updater<SelectedTrack[]>;
    updateUrl : (tracks:SelectedTrack[]) => void
}

export default function ExploreSection1({
  setSelectedTracks,
  selectedTracks,
  updateUrl,
}:Prob) {
  const additionalBoxRenderCondition = !!(
    selectedTracks[selectedTracks.length - 1]?.track && selectedTracks.length < 6);
  const additionalBoxRenderCondition2 = selectedTracks.length === 0;
  const totalBoxes = selectedTracks.length + ((additionalBoxRenderCondition
     || additionalBoxRenderCondition2) ? 1 : 0);
  const colorArray = Object.values(Color);
  const [containerWidth, setContainerWidth] = useState<number>(0); // 뷰포트
  const containerRef = useRef<HTMLInputElement>(null);

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

  function selectTrack(id: number, selectedTrack: TrackWithArtistResponse) {
    setSelectedTracks((draft) => {
      const isSameTrack = draft.some((item) => selectedTrack.id === item?.track?.id);
      if (isSameTrack) {
        alert('이미 선택된 곡입니다.');
        return;
      }
      const trackIndex = draft.findIndex((item) => item.id === id);
      if (trackIndex !== -1) {
        draft[trackIndex].track = selectedTrack;
        updateUrl(draft);
      }
    });
  }

  function deleteTrack(id: number) {
    setSelectedTracks((draft) => {
      const index = draft.findIndex((box) => box.id === id);
      if (index !== -1) {
        draft[index].track = null;
      }
    });
  }

  function addSelectBox(id:number) {
    setSelectedTracks((draft) => {
      draft.push({ id, activate: true, color: colorArray[id] });
    });
  }

  function deleteSelectBox(id: number) {
    setSelectedTracks((draft) => {
      // 해당 id를 가진 박스를 배열에서 삭제
      const index = draft.findIndex((box) => box.id === id);
      if (index !== -1) {
        draft.splice(index, 1); // 배열에서 해당 인덱스의 요소를 제거
      }
    });
  }
  function calculateBoxWidth() {
    const gap = 2 * (totalBoxes - 1);
    if (containerWidth < 640) {
      return '100%';
    }
    if (totalBoxes <= 3) {
      return (containerWidth - gap * 8) / totalBoxes;
    }
    return (containerWidth - gap * 8) / 3;
  }

  return (
    <section ref={containerRef} className="flex flex-wrap gap-2 items-center justify-center mt-[5rem] w-[100%] md:w-[90%] lg:w-[80%]">
      {selectedTracks.map((selectedTrack, index) => (
        <div key={index} style={{ width: calculateBoxWidth() }}>
          <SearchTrackBox
            selectedTrack={selectedTrack}
            selectTrack={selectTrack}
            addSelectBox={addSelectBox}
            deleteSelectBox={deleteSelectBox}
            deleteTrack={deleteTrack}
          />
        </div>
      ))}

      {/* 마지막 인덱스에 추가 박스 렌더링 */}
      {(additionalBoxRenderCondition || additionalBoxRenderCondition2) && (
        <div style={{ width: calculateBoxWidth() }}>
          <SearchTrackBox
            selectedTrack={{
              id: selectedTracks.length,
              activate: false,
              color: colorArray[selectedTracks.length],
            }}
            selectTrack={selectTrack}
            addSelectBox={addSelectBox}
            deleteSelectBox={deleteSelectBox}
            deleteTrack={deleteTrack}
          />
        </div>
      )}
    </section>
  );
}
