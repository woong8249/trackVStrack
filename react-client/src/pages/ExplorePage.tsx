/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
import TopNavbar from '@components/type2/TopNavBar';
import SearchTrackBox from '@components/type2/SearchTrackBox';
import { TrackWithArtistResponse } from '@typings/track';
import { useEffect, useRef, useState } from 'react';
import { useImmer } from 'use-immer';
enum Color {
  Blue = 'bg-blue-500',
  Red = 'bg-red-500',
  Green = 'bg-green-500',
  Yellow = 'bg-yellow-500',
  Purple = 'bg-purple-500',
  Black = 'bg-black',
}

export interface SelectTrackBox {
  id: number;
  activate:boolean
  track?: TrackWithArtistResponse|null;
  color:Color
}

export default function ExplorePage() {
  const colorArray = Object.values(Color);
  const initialSelectTrackBoxes = [{ id: 0, activate: true, color: colorArray[0] }];
  const containerRef = useRef<HTMLInputElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0); // 뷰포트 너비 저장
  const [
    selectTrackBoxes,
    setSelectTrackBoxes,
  ] = useImmer<SelectTrackBox[]>(initialSelectTrackBoxes);

  const additionalBoxRenderCondition = !!(
    selectTrackBoxes[selectTrackBoxes.length - 1]?.track && selectTrackBoxes.length < 6);
  const totalBoxes = selectTrackBoxes.length + (additionalBoxRenderCondition ? 1 : 0);

  const calculateBoxWidth = () => {
    if (containerWidth >= 1024) {
      return totalBoxes === 1 ? '90%' : totalBoxes === 2 ? '45%' : '30%';
    }
    if (containerWidth >= 640) {
      return totalBoxes === 1 ? '90%' : '45%';
    }
    return '90%';
  };

  function selectTrack(id: number, selectedTrack: TrackWithArtistResponse) {
    setSelectTrackBoxes((draft) => {
      const isSameTrack = draft.some((item) => selectedTrack.id === item?.track?.id);
      if (isSameTrack) {
        alert('이미 선택된 곡입니다.');
        return;
      }
      const trackIndex = draft.findIndex((item) => item.id === id);
      if (trackIndex !== -1) {
        draft[trackIndex].track = selectedTrack;
      }
    });
  }

  function deleteTrack(id: number) {
    setSelectTrackBoxes((draft) => {
      const index = draft.findIndex((box) => box.id === id);
      if (index !== -1) {
        draft[index].track = null;
      }
    });
  }

  function addSelectBox(id:number) {
    setSelectTrackBoxes((draft) => {
      draft.push({ id, activate: true, color: colorArray[id] });
    });
  }

  function deleteSelectBox(id: number) {
    setSelectTrackBoxes((draft) => {
      // 해당 id를 가진 박스를 배열에서 삭제
      const index = draft.findIndex((box) => box.id === id);
      if (index !== -1) {
        draft.splice(index, 1); // 배열에서 해당 인덱스의 요소를 제거
      }
    });
  }

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

  useEffect(() => {
    if (selectTrackBoxes.length === 0) {
      setSelectTrackBoxes(initialSelectTrackBoxes);
    }
  }, [initialSelectTrackBoxes]);

  return (
    <div ref={containerRef} className="bg-[#eaeff8] min-h-screen flex flex-col items-center min-w-[350px]">
      <TopNavbar currentPage="explore" />

      <section className="flex flex-wrap gap-4 items-center justify-center mt-[5rem] w-[90%]">
        {selectTrackBoxes.map((selectedTrack) => (
          <div style={{ width: calculateBoxWidth() }}>
            <SearchTrackBox
              selectTrackBox={selectedTrack}
              selectTrack={selectTrack}
              addSelectBox={addSelectBox}
              deleteSelectBox={deleteSelectBox}
              deleteTrack={deleteTrack}
            />
          </div>
        ))}

        {/* 마지막 인덱스에 추가 박스 렌더링 */}
        {additionalBoxRenderCondition && (
          <div style={{ width: calculateBoxWidth() }}>
            <SearchTrackBox
              selectTrackBox={{
                id: selectTrackBoxes.length,
                activate: false,
                color: colorArray[selectTrackBoxes.length],
              }}
              selectTrack={selectTrack}
              addSelectBox={addSelectBox}
              deleteSelectBox={deleteSelectBox}
              deleteTrack={deleteTrack}
            />
          </div>
        )}
      </section>
    </div>
  );
}
