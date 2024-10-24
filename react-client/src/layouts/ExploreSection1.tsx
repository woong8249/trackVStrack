/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
import SearchTrackBox from '@components/type2/SearchTrackBox';
import { Color, SelectedTrack } from '@pages/ExplorePage';
import { TrackWithArtistResponse } from '@typings/track';
import { Updater } from 'use-immer';

interface Prob{
    selectedTracks: SelectedTrack[]; // 상태 값
    setSelectedTracks: Updater<SelectedTrack[]>;
    containerWidth:number
}

export default function ExploreSection1({
  setSelectedTracks,
  selectedTracks, containerWidth,
}:Prob) {
  const additionalBoxRenderCondition = !!(
    selectedTracks[selectedTracks.length - 1]?.track && selectedTracks.length < 6);
  const totalBoxes = selectedTracks.length + (additionalBoxRenderCondition ? 1 : 0);
  const colorArray = Object.values(Color);

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

  function calculateBoxWidth() {
    if (containerWidth >= 1024) {
      return totalBoxes === 1 ? '90%' : totalBoxes === 2 ? '45%' : '30%';
    }
    if (containerWidth >= 640) {
      return totalBoxes === 1 ? '90%' : '45%';
    }
    return '100%';
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

  return (
    <section className="flex flex-wrap gap-4 items-center justify-center mt-[5rem] w-[90%]">
      {selectedTracks.map((selectedTrack) => (
        <div style={{ width: calculateBoxWidth() }}>
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
      {additionalBoxRenderCondition && (
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
